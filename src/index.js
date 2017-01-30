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

  return {
    start() {
      if (process) {
        throw new Error('Process already started');
      }

      logger.info('Starting...');
      return new Promise((resolve, reject) => {
        process = spawn(command, args, {
          stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        });

        process.on('exit', (code, signal) => {
          logger.warn('Exited', { code, signal });
          process = null;
          if (autoRestart) {
            logger.debug('Autorestart');
            this.start().then(resolve, reject);
          } else {
            reject();
          }
        });

        process.on('message', (message) => {
          if (message === 'ready') {
            logger.info('Ready !');
            resolve();
          } else if (message === 'restart') {
            this.restart();
          } else {
            logger.info('message', { message });
          }
        });
      });
    },

    stop() {
      if (!process) return Promise.resolve(stopPromise);

      logger.info('Stopping...');
      return stopPromise = new Promise(resolve => {
        const runningProcess = process;
        process = null;

        const killTimeout = setTimeout(() => {
          logger.warn('Timeout: sending SIGKILL...');
          runningProcess.kill('SIGKILL');
        }, SIGTERMTimeout);

        runningProcess.removeAllListeners();
        runningProcess.once('exit', (code, signal) => {
          logger.info('Stopped', { code, signal });
          if (killTimeout) clearTimeout(killTimeout);
          stopPromise = null;
          resolve();
        });
        runningProcess.kill();
      });
    },

    restart() {
      logger.info('Restarting...');
      return this.stop().then(() => this.start());
    },

    sendSIGUSR2() {
      process.kill('SIGUSR2');
    },
  };
};
