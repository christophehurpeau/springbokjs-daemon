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

(0, _nightingale.addConfig)({ key: 'springbokjs-daemon', handler: new _nightingaleConsole2.default(_nightingale.levels.INFO) });

class SpringbokDaemon extends _events.EventEmitter {
    constructor(command, args) {
        super();
        this.command = command;
        this.args = args;
        this.process = null;
        this.stopPromise = null;
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

        this.process.addListener('exit', (code, signal) => {
            this.logger.warn('Exited', { code, signal });
            this.process = null;
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
        return this.stop().then(() => {
            return this.start();
        });
    }

    restartTimeout(timeout) {
        if (!(typeof timeout === 'number')) {
            throw new TypeError('Value of argument "timeout" violates contract.\n\nExpected:\nnumber\n\nGot:\n' + _inspect(timeout));
        }

        return setTimeout(() => {
            return this.restart();
        }, timeout);
    }
}

function createDaemon(command, args) {
    return new SpringbokDaemon(command, args);
}

const node = exports.node = args => {
    return createDaemon('node', args);
};
createDaemon.node = node;

function _inspect(input, depth) {
    const maxDepth = 4;
    const maxKeys = 15;

    if (depth === undefined) {
        depth = 0;
    }

    depth += 1;

    if (input === null) {
        return 'null';
    } else if (input === undefined) {
        return 'void';
    } else if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
        return typeof input;
    } else if (Array.isArray(input)) {
        if (input.length > 0) {
            if (depth > maxDepth) return '[...]';

            const first = _inspect(input[0], depth);

            if (input.every(item => _inspect(item, depth) === first)) {
                return first.trim() + '[]';
            } else {
                return '[' + input.slice(0, maxKeys).map(item => _inspect(item, depth)).join(', ') + (input.length >= maxKeys ? ', ...' : '') + ']';
            }
        } else {
            return 'Array';
        }
    } else {
        const keys = Object.keys(input);

        if (!keys.length) {
            if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
                return input.constructor.name;
            } else {
                return 'Object';
            }
        }

        if (depth > maxDepth) return '{...}';
        const indent = '  '.repeat(depth - 1);
        let entries = keys.slice(0, maxKeys).map(key => {
            return (/^([A-Z_$][A-Z0-9_$]*)$/i.test(key) ? key : JSON.stringify(key)) + ': ' + _inspect(input[key], depth) + ';';
        }).join('\n  ' + indent);

        if (keys.length >= maxKeys) {
            entries += '\n  ' + indent + '...';
        }

        if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
            return input.constructor.name + ' {\n  ' + indent + entries + '\n' + indent + '}';
        } else {
            return '{\n  ' + indent + entries + '\n' + indent + '}';
        }
    }
}
//# sourceMappingURL=index.js.map