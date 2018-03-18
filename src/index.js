/* eslint-disable flowtype/sort-keys */
import { spawn } from 'child_process';
import gracefulKill from 'graceful-kill';
import split from 'split';
import Logger, { addConfig, levels } from 'nightingale/src';
import ConsoleLogger from 'nightingale-console/src';

addConfig({ pattern: /^springbokjs-daemon/, handler: new ConsoleLogger(levels.INFO) });

type OptionsType = {|
  key?: ?string,
  displayName?: ?string,
  prefixStdout?: ?boolean,
  command?: string,
  args?: Array<string | number>,
  cwd?: string,
  autoRestart?: boolean,
  SIGTERMTimeout?: number,
|};

export default ({
  key,
  displayName,
  prefixStdout = false,
  command = global.process.argv[0],
  args = [],
  cwd,
  autoRestart = false,
  SIGTERMTimeout = 4000,
}: ?OptionsType = {}) => {
  let process = null;
  let stopPromise = null;
  const logger = new Logger(`springbokjs-daemon${key ? `:${key}` : ''}`, displayName);
  logger.info('created', { command, args });

  const stop = () => {
    if (!process) return Promise.resolve(stopPromise);

    const runningProcess = process;
    process = null;

    runningProcess.removeAllListeners();
    stopPromise = gracefulKill(runningProcess, SIGTERMTimeout).then(() => {
      stopPromise = null;
    });
    return stopPromise;
  };

  const start = () => {
    if (process) {
      throw new Error('Process already started');
    }

    return new Promise((resolve, reject) => {
      const stdoutOption = prefixStdout ? 'pipe' : 'inherit';
      process = spawn(command, args, {
        cwd,
        stdio: ['ignore', stdoutOption, stdoutOption, 'ipc'],
      });

      if (prefixStdout) {
        const logStreamInLogger = (stream, loggerType) => {
          stream.pipe(split()).on('data', line => {
            if (line.length === 0) return;
            if (line.startsWith('{') && line.endsWith('}')) {
              try {
                const json = JSON.parse(line);
                logger[loggerType]('', json);
                return;
              } catch (err) {}
            }

            logger[loggerType](line);
          });
        };

        logStreamInLogger(process.stdout, 'info');
        logStreamInLogger(process.stderr, 'error');
      }

      process.on('exit', (code, signal) => {
        logger.warn('exited', { code, signal });
        process = null;
        if (autoRestart) {
          logger.debug('autorestart');
          start().then(resolve, reject);
        } else {
          reject();
        }
      });

      process.on('message', message => {
        if (message === 'ready') {
          logger.success('ready');
          resolve();
        } else if (message === 'restart') {
          logger.info('restarting...');
          stop().then(() => start());
        } else {
          logger.info('message', { message });
        }
      });
    });
  };

  return {
    hasExited() {
      return process === null;
    },

    start() {
      logger.info('starting...');
      return start();
    },

    stop() {
      if (!process) logger.info('stopping...');
      return stop();
    },

    restart() {
      logger.info('restarting...');
      return stop().then(() => start());
    },

    sendSIGUSR2() {
      process.kill('SIGUSR2');
    },
  };
};
