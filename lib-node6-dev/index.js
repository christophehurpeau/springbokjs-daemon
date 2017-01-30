'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _tcombForked = require('tcomb-forked');

var _tcombForked2 = _interopRequireDefault(_tcombForked);

var _child_process = require('child_process');

var _nightingale = require('nightingale');

var _nightingale2 = _interopRequireDefault(_nightingale);

var _nightingaleConsole = require('nightingale-console');

var _nightingaleConsole2 = _interopRequireDefault(_nightingaleConsole);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _nightingale.addConfig)({ pattern: /^springbokjs-daemon/, handler: new _nightingaleConsole2.default(_nightingale.levels.INFO) });

const OptionsType = _tcombForked2.default.interface({
  key: _tcombForked2.default.maybe(_tcombForked2.default.String),
  displayName: _tcombForked2.default.maybe(_tcombForked2.default.String),
  command: _tcombForked2.default.maybe(_tcombForked2.default.String),
  args: _tcombForked2.default.maybe(_tcombForked2.default.list(_tcombForked2.default.union([_tcombForked2.default.String, _tcombForked2.default.Number]))),
  autoRestart: _tcombForked2.default.maybe(_tcombForked2.default.Boolean),
  SIGTERMTimeout: _tcombForked2.default.maybe(_tcombForked2.default.Number)
}, {
  name: 'OptionsType',
  strict: true
});

exports.default = function index({
  key,
  displayName,
  command = global.process.argv[0],
  args = [],
  autoRestart = false,
  SIGTERMTimeout = 4000
} = {}) {
  _assert({
    key,
    displayName,
    command,
    args,
    autoRestart,
    SIGTERMTimeout
  }, OptionsType, '{ key, displayName, command = global.process.argv[0], args = [], autoRestart = false, SIGTERMTimeout = 4000 }');

  let process = null;
  let stopPromise = null;
  const logger = new _nightingale2.default(`springbokjs-daemon${key ? `:${key}` : ''}`, displayName);
  logger.info('created', { command, args });

  return {
    start() {
      if (process) {
        throw new Error('Process already started');
      }

      logger.info('starting...');
      return new Promise((resolve, reject) => {
        process = (0, _child_process.spawn)(command, args, {
          stdio: ['inherit', 'inherit', 'inherit', 'ipc']
        });

        process.on('exit', (code, signal) => {
          logger.warn('exited', { code, signal });
          process = null;
          if (autoRestart) {
            logger.debug('autorestart');
            this.start().then(resolve, reject);
          } else {
            reject();
          }
        });

        process.on('message', message => {
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
    },

    stop() {
      if (!process) return Promise.resolve(stopPromise);

      logger.info('stopping...');
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
    },

    restart() {
      logger.info('restarting...');
      return this.stop().then(() => this.start());
    },

    sendSIGUSR2() {
      process.kill('SIGUSR2');
    }
  };
};

function _assert(x, type, name) {
  if (false) {
    _tcombForked2.default.fail = function (message) {
      console.warn(message);
    };
  }

  if (_tcombForked2.default.isType(type) && type.meta.kind !== 'struct') {
    if (!type.is(x)) {
      type(x, [name + ': ' + _tcombForked2.default.getTypeName(type)]);
    }
  } else if (!(x instanceof type)) {
    _tcombForked2.default.fail('Invalid value ' + _tcombForked2.default.stringify(x) + ' supplied to ' + name + ' (expected a ' + _tcombForked2.default.getTypeName(type) + ')');
  }

  return x;
}
//# sourceMappingURL=index.js.map