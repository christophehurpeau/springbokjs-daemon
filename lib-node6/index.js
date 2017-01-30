'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require('child_process');

var _nightingale = require('nightingale');

var _nightingale2 = _interopRequireDefault(_nightingale);

var _nightingaleConsole = require('nightingale-console');

var _nightingaleConsole2 = _interopRequireDefault(_nightingaleConsole);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _nightingale.addConfig)({ pattern: /^springbokjs-daemon/, handler: new _nightingaleConsole2.default(_nightingale.levels.INFO) });

exports.default = ({
  key,
  displayName,
  command = global.process.argv[0],
  args = [],
  autoRestart = false,
  SIGTERMTimeout = 4000
} = {}) => {
  let process = null;
  let stopPromise = null;
  const logger = new _nightingale2.default(`springbokjs-daemon${key ? `:${key}` : ''}`, displayName);
  logger.info('created', { command, args });

  return {
    start() {
      if (process) {
        throw new Error('Process already started');
      }

      logger.info('Starting...');
      return new Promise((resolve, reject) => {
        process = (0, _child_process.spawn)(command, args, {
          stdio: ['pipe', 'pipe', 'pipe', 'ipc']
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

        process.on('message', message => {
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
    }
  };
};
//# sourceMappingURL=index.js.map