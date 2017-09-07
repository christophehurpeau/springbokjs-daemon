'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require('child_process');

var _gracefulKill = require('graceful-kill');

var _gracefulKill2 = _interopRequireDefault(_gracefulKill);

var _split = require('split');

var _split2 = _interopRequireDefault(_split);

var _nightingale = require('nightingale');

var _nightingale2 = _interopRequireDefault(_nightingale);

var _nightingaleConsole = require('nightingale-console');

var _nightingaleConsole2 = _interopRequireDefault(_nightingaleConsole);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _nightingale.addConfig)({ pattern: /^springbokjs-daemon/, handler: new _nightingaleConsole2.default(_nightingale.levels.INFO) });

exports.default = ({
  key,
  displayName,
  prefixStdout = false,
  command = global.process.argv[0],
  args = [],
  cwd,
  autoRestart = false,
  SIGTERMTimeout = 4000
} = {}) => {
  let process = null;
  let stopPromise = null;
  const logger = new _nightingale2.default(`springbokjs-daemon${key ? `:${key}` : ''}`, displayName);
  logger.info('created', { command, args });

  const stop = () => {
    if (!process) return Promise.resolve(stopPromise);

    const runningProcess = process;
    process = null;

    runningProcess.removeAllListeners();
    return stopPromise = (0, _gracefulKill2.default)(runningProcess, SIGTERMTimeout).then(() => {
      stopPromise = null;
    });
  };

  const start = () => {
    if (process) {
      throw new Error('Process already started');
    }

    return new Promise((resolve, reject) => {
      const stdoutOption = prefixStdout ? 'pipe' : 'inherit';
      process = (0, _child_process.spawn)(command, args, {
        cwd,
        stdio: ['ignore', stdoutOption, stdoutOption, 'ipc']
      });

      if (prefixStdout) {
        const logStreamInLogger = (stream, loggerType) => {
          stream.pipe((0, _split2.default)()).on('data', line => {
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
    }
  };
};
//# sourceMappingURL=index.js.map