'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.node = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = createDaemon;

var _child_process = require('child_process');

var _nightingale = require('nightingale');

var _nightingale2 = _interopRequireDefault(_nightingale);

var _nightingaleConsole = require('nightingale-console');

var _nightingaleConsole2 = _interopRequireDefault(_nightingaleConsole);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(0, _nightingale.addConfig)({ key: 'springbokjs-daemon', handler: new _nightingaleConsole2.default() });

var SpringbokDaemon = function (_EventEmitter) {
    _inherits(SpringbokDaemon, _EventEmitter);

    function SpringbokDaemon(command, args) {
        _classCallCheck(this, SpringbokDaemon);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SpringbokDaemon).call(this));

        _this.command = command;
        _this.args = args;
        _this.process = null;
        _this.logger = new _nightingale2.default('springbokjs-daemon');
        _this.logger.info(command + (args && ' ' + args.join(' ')));
        return _this;
    }

    _createClass(SpringbokDaemon, [{
        key: 'start',
        value: function start() {
            var _this2 = this;

            if (this.process) {
                throw new Error('Process already started');
            }

            this.logger.info('Starting...');

            this.process = (0, _child_process.spawn)(this.command, this.args, { env: process.env });
            this.process.stdout.addListener('data', function (data) {
                process.stdout.write(data);
                _this2.emit('stdout', data);
            });
            this.process.stderr.addListener('data', function (data) {
                process.stderr.write(data);
                _this2.emit('stderr', data);
            });

            this.process.addListener('exit', function (code) {
                _this2.logger.warn('Exited', { exitStatus: code });
                _this2.process = null;
            });
        }
    }, {
        key: 'stop',
        value: function stop() {
            var _this3 = this;

            if (this.process) {
                this.logger.info('Stopping...');
                var _process = this.process;
                this.process = null;

                _process.removeAllListeners();
                _process.addListener('exit', function (code) {
                    _this3.logger.info('Stopped', { exitStatus: code });
                });
                _process.kill();
            }
        }
    }, {
        key: 'restart',
        value: function restart() {
            this.logger.info('Restarting...');
            this.stop();
            this.start();
        }
    }, {
        key: 'restartTimeout',
        value: function restartTimeout(timeout) {
            var _this4 = this;

            if (!(typeof timeout === 'number')) {
                throw new TypeError('Value of argument "timeout" violates contract.\n\nExpected:\nnumber\n\nGot:\n' + _inspect(timeout));
            }

            return setTimeout(function () {
                return _this4.restart();
            }, timeout);
        }
    }]);

    return SpringbokDaemon;
}(_events.EventEmitter);

function createDaemon(command, args) {
    return new SpringbokDaemon(command, args);
}

var node = exports.node = function node(args) {
    return createDaemon('node', args);
};
createDaemon.node = node;

function _inspect(input, depth) {
    var maxDepth = 4;
    var maxKeys = 15;

    if (depth === undefined) {
        depth = 0;
    }

    depth += 1;

    if (input === null) {
        return 'null';
    } else if (input === undefined) {
        return 'void';
    } else if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
        return typeof input === 'undefined' ? 'undefined' : _typeof(input);
    } else if (Array.isArray(input)) {
        if (input.length > 0) {
            var _ret = function () {
                if (depth > maxDepth) return {
                        v: '[...]'
                    };

                var first = _inspect(input[0], depth);

                if (input.every(function (item) {
                    return _inspect(item, depth) === first;
                })) {
                    return {
                        v: first.trim() + '[]'
                    };
                } else {
                    return {
                        v: '[' + input.slice(0, maxKeys).map(function (item) {
                            return _inspect(item, depth);
                        }).join(', ') + (input.length >= maxKeys ? ', ...' : '') + ']'
                    };
                }
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        } else {
            return 'Array';
        }
    } else {
        var keys = Object.keys(input);

        if (!keys.length) {
            if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
                return input.constructor.name;
            } else {
                return 'Object';
            }
        }

        if (depth > maxDepth) return '{...}';
        var indent = '  '.repeat(depth - 1);
        var entries = keys.slice(0, maxKeys).map(function (key) {
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