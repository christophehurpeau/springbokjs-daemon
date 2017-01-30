import { spawn } from 'child_process';
import Logger, { addConfig, levels } from 'nightingale/src';
import ConsoleLogger from 'nightingale-console/src';

addConfig({ pattern: /^springbokjs-daemon/, handler: new ConsoleLogger(levels.INFO) });

type OptionsType = {|
  key: ?string,
  displayName: ?string,
  command: ?string,
  args: ?Array<string | number>,
  autoRestart: ?boolean,
  SIGTERMTimeout: ?number,
|};

export default ({
  key,
  displayName,
  command = global.process.argv[0],
  args = [],
  autoRestart = false,
  SIGTERMTimeout = 4000,
}: OptionsType = {}) => {
  let process = null;
  let stopPromise = null;
  const logger = new Logger(`springbokjs-daemon${key ? `:${key}` : ''}`, displayName);
  logger.info('created', { command, args });

  const start = () => {
    if (process) {
      throw new Error('Process already started');
    }

    return new Promise((resolve, reject) => {
      process = spawn(command, args, {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      });

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

      process.on('message', (message) => {
        if (message === 'ready') {
          logger.success('ready');
          resolve();
        } else if (message === 'restart') {
          this.restart();
        } else {
          logger.info('message', { message });
        }
      });
    });
  };

  const stop = () => (
    stopPromise = new Promise(resolve => {
      const runningProcess = process;
      process = null;

      const killTimeout = setTimeout(() => {
        logger.warn('timeout: sending SIGKILL...');
        runningProcess.kill('SIGKILL');
      }, SIGTERMTimeout);

      runningProcess.removeAllListeners();
      runningProcess.once('exit', (code, signal) => {
        logger.info('stopped', { code, signal });
        if (killTimeout) clearTimeout(killTimeout);
        stopPromise = null;
        resolve();
      });
      runningProcess.kill();
    })
  );

  return {
    start() {
      logger.info('starting...');
      return start();
    },

    stop() {
      if (!process) return Promise.resolve(stopPromise);

      logger.info('stopping...');
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
