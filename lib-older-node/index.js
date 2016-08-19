'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.node = undefined;

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
                _process.addListener('exit', function (code, signal) {
                    _this3.logger.info('Stopped', { code: code, signal: signal });
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
//# sourceMappingURL=index.js.map