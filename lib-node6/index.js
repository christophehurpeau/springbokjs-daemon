'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.node = undefined;
exports.default = createDaemon;

var _child_process = require('child_process');

var _nightingale = require('nightingale');

var _nightingale2 = _interopRequireDefault(_nightingale);

var _nightingaleConsole = require('nightingale-console');

var _nightingaleConsole2 = _interopRequireDefault(_nightingaleConsole);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _nightingale.addConfig)({ key: 'springbokjs-daemon', handler: new _nightingaleConsole2.default() });

class SpringbokDaemon extends _events.EventEmitter {
    constructor(command, args) {
        super();
        this.command = command;
        this.args = args;
        this.process = null;
        this.logger = new _nightingale2.default('springbokjs-daemon');
        this.logger.info(command + (args && ` ${ args.join(' ') }`));
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

        this.process.addListener('exit', code => {
            this.logger.warn('Exited', { exitStatus: code });
            this.process = null;
        });
    }

    stop() {
        if (this.process) {
            this.logger.info('Stopping...');
            const process = this.process;
            this.process = null;

            process.removeAllListeners();
            process.addListener('exit', (code, signal) => {
                this.logger.info('Stopped', { code, signal });
            });
            process.kill();
        }
    }

    restart() {
        this.logger.info('Restarting...');
        this.stop();
        this.start();
    }

    restartTimeout(timeout) {
        return setTimeout(() => this.restart(), timeout);
    }
}

function createDaemon(command, args) {
    return new SpringbokDaemon(command, args);
}

const node = exports.node = args => createDaemon('node', args);
createDaemon.node = node;
//# sourceMappingURL=index.js.map