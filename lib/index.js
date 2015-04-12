'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, '__esModule', {
    value: true
});
var childProcess = require('child_process');
var util = require('util');
var ConsoleLogger = require('springbokjs-logger/console');
var EventEmitter = require('events').EventEmitter;

var SpringbokDaemon = (function (_EventEmitter) {
    function SpringbokDaemon(command, args) {
        _classCallCheck(this, SpringbokDaemon);

        _get(Object.getPrototypeOf(SpringbokDaemon.prototype), 'constructor', this).call(this);
        this.command = command;
        this.args = args;
        this.process = null;
        this.restarting = false;
        this.logger = new ConsoleLogger();
        this.logger.setPrefix('springbokjs-daemon: ', this.logger.blue.bold);
        this.logger.debug(command + (args && ' ' + args.join(' ')));
    }

    _inherits(SpringbokDaemon, _EventEmitter);

    _createClass(SpringbokDaemon, [{
        key: 'start',
        value: function start() {
            this.logger.debug('Starting');
            this.stop();

            this.process = childProcess.spawn(this.command, this.args);
            this.process.stdout.addListener('data', (function (data) {
                process.stdout.write(data);
                this.emit('stdout', data);
            }).bind(this));
            this.process.stderr.addListener('data', (function (data) {
                process.stderr.write(data);
                this.emit('stderr', data);
            }).bind(this));
            this.process.addListener('exit', (function (code) {
                this.logger.debug('exited (status=' + code + ')');
                this.process = null;
                if (this.restarting) {
                    this.start();
                }
            }).bind(this));
        }
    }, {
        key: 'stop',
        value: function stop() {
            this.restarting = false;
            if (this.process) {
                this.process.kill();
            }
        }
    }, {
        key: 'restart',
        value: function restart() {
            if (this.process) {
                this.logger.debug('Stopping for restart');
                this.restarting = true;
                this.process.kill();
            } else {
                this.start();
            }
        }
    }]);

    return SpringbokDaemon;
})(EventEmitter);

var createDaemon = function createDaemon(command, args) {
    return new SpringbokDaemon(command, args);
};

exports['default'] = createDaemon;

createDaemon.node = function (args) {
    return createDaemon('node', args);
};
module.exports = exports['default'];
//# sourceMappingURL=index.js.map