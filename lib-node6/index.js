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
        this.restarting = false;
        this.stopping = false;
        this.logger = new _nightingale2.default('springbokjs-daemon');
        this.logger.info(command + (args && ` ${ args.join(' ') }`));
    }

    start() {
        this.stopping = false;
        this.logger.debug('Starting...');
        this.stop();

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
            if (this.stopping) {
                this.logger.info('Stopped', { exitStatus: code });
            } else {
                this.logger.warn('Exited', { exitStatus: code });
            }

            this.process = null;
            if (this.restarting) {
                this.start();
            }
        });
    }

    stop() {
        this.restarting = false;
        if (this.process) {
            this.stopping = true;
            this.logger.info('Stopping...');
            this.process.kill();
        }
    }

    restart() {
        this.logger.info('Restarting...');
        if (this.process) {
            this.restarting = true;
            this.process.kill();
        } else {
            this.start();
        }
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