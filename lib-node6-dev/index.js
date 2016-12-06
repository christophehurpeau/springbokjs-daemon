'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.node = undefined;
exports.default = createDaemon;

var _tcombForked = require('tcomb-forked');

var _tcombForked2 = _interopRequireDefault(_tcombForked);

var _child_process = require('child_process');

var _events = require('events');

var _nightingale = require('nightingale');

var _nightingale2 = _interopRequireDefault(_nightingale);

var _nightingaleConsole = require('nightingale-console');

var _nightingaleConsole2 = _interopRequireDefault(_nightingaleConsole);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _nightingale.addConfig)({ key: 'springbokjs-daemon', handler: new _nightingaleConsole2.default(_nightingale.levels.INFO) });

const OptionsType = _tcombForked2.default.interface({
  autorestart: _tcombForked2.default.maybe(_tcombForked2.default.Boolean)
}, {
  name: 'OptionsType',
  strict: true
});

class SpringbokDaemon extends _events.EventEmitter {
  constructor(command, args, { autorestart } = {}) {
    _assert({
      autorestart
    }, OptionsType, '{ autorestart }');

    super();
    this.command = command;
    this.args = args;
    this.process = null;
    this.stopPromise = null;
    this.logger = new _nightingale2.default('springbokjs-daemon');
    this.logger.info(command + (args && ` ${ args.join(' ') }`));
    this.autorestart = autorestart || false;
  }

  start() {
    if (this.process) {
      throw new Error('Process already started');
    }

    this.logger.info('Starting...');

    this.process = (0, _child_process.spawn)(this.command, this.args, { env: process.env });
    this.process.stdout.addListener('data', data => {
      process.stdout.write(data);
      this.emit('stdout', data);
    });
    this.process.stderr.addListener('data', data => {
      process.stderr.write(data);
      this.emit('stderr', data);
    });

    this.process.addListener('exit', (code, signal) => {
      this.logger.warn('Exited', { code, signal });
      this.process = null;
      if (this.autorestart) {
        this.logger.debug('Autorestart');
        this.start();
      }
    });
  }

  stop() {
    if (!this.process) return Promise.resolve(this.stopPromise);

    this.logger.info('Stopping...');
    return this.stopPromise = new Promise(resolve => {
      const process = this.process;
      this.process = null;

      const killTimeout = setTimeout(() => {
        this.logger.warn('Timeout: sending SIGKILL...');
        process.kill('SIGKILL');
      }, 4000);

      process.removeAllListeners();
      process.addListener('exit', (code, signal) => {
        this.logger.info('Stopped', { code, signal });
        if (killTimeout) clearTimeout(killTimeout);
        this.stopPromise = null;
        resolve();
      });
      process.kill();
    });
  }

  restart() {
    this.logger.info('Restarting...');
    return this.stop().then(() => this.start());
  }

  restartTimeout(timeout) {
    _assert(timeout, _tcombForked2.default.Number, 'timeout');

    return setTimeout(() => this.restart(), timeout);
  }
}

function createDaemon(command, args) {
  return new SpringbokDaemon(command, args);
}

const node = exports.node = args => createDaemon('node', args);
createDaemon.node = node;

function _assert(x, type, name) {
  function message() {
    return 'Invalid value ' + _tcombForked2.default.stringify(x) + ' supplied to ' + name + ' (expected a ' + _tcombForked2.default.getTypeName(type) + ')';
  }

  if (_tcombForked2.default.isType(type)) {
    if (!type.is(x)) {
      type(x, [name + ': ' + _tcombForked2.default.getTypeName(type)]);

      _tcombForked2.default.fail(message());
    }
  } else if (!(x instanceof type)) {
    _tcombForked2.default.fail(message());
  }

  return x;
}
//# sourceMappingURL=index.js.map