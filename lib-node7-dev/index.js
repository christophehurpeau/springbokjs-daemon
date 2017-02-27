'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require('child_process');

var _nightingale = require('nightingale');

var _nightingale2 = _interopRequireDefault(_nightingale);

var _nightingaleConsole = require('nightingale-console');

var _nightingaleConsole2 = _interopRequireDefault(_nightingaleConsole);

var _flowRuntime = require('flow-runtime');

var _flowRuntime2 = _interopRequireDefault(_flowRuntime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _nightingale.addConfig)({ pattern: /^springbokjs-daemon/, handler: new _nightingaleConsole2.default(_nightingale.levels.INFO) });

const OptionsType = _flowRuntime2.default.type('OptionsType', _flowRuntime2.default.exactObject(_flowRuntime2.default.property('key', _flowRuntime2.default.nullable(_flowRuntime2.default.string())), _flowRuntime2.default.property('displayName', _flowRuntime2.default.nullable(_flowRuntime2.default.string())), _flowRuntime2.default.property('command', _flowRuntime2.default.nullable(_flowRuntime2.default.string())), _flowRuntime2.default.property('args', _flowRuntime2.default.nullable(_flowRuntime2.default.array(_flowRuntime2.default.union(_flowRuntime2.default.string(), _flowRuntime2.default.number())))), _flowRuntime2.default.property('cwd', _flowRuntime2.default.nullable(_flowRuntime2.default.string())), _flowRuntime2.default.property('autoRestart', _flowRuntime2.default.nullable(_flowRuntime2.default.boolean())), _flowRuntime2.default.property('SIGTERMTimeout', _flowRuntime2.default.nullable(_flowRuntime2.default.number()))));

exports.default = function index({
  key,
  displayName,
  command = global.process.argv[0],
  args = [],
  cwd,
  autoRestart = false,
  SIGTERMTimeout = 4000
} = {}) {
  if (arguments[0] !== undefined) {
    _flowRuntime2.default.param('arguments[0]', OptionsType).assert(arguments[0]);
  }

  let process = null;
  let stopPromise = null;
  const logger = new _nightingale2.default(`springbokjs-daemon${key ? `:${key}` : ''}`, displayName);
  logger.info('created', { command, args });

  const stop = () => {
    if (!process) return Promise.resolve(stopPromise);

    return stopPromise = new Promise(resolve => {
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
    });
  };

  const start = () => {
    if (process) {
      throw new Error('Process already started');
    }

    return new Promise((resolve, reject) => {
      process = (0, _child_process.spawn)(command, args, {
        cwd,
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
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