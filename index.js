var child_process = require('child_process');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function SpringbokDaemon(command, args) {
    EventEmitter.call(this);
    this.command = command;
    this.args = args;
    this.process = null;
    this.restarting = false;
};

util.inherits(SpringbokDaemon, EventEmitter);

var prototype = {
    start: function() {
        util.debug('[springbokjs-daemon] Starting');
        this.stop();

        this.process = child_process.spawn(this.command, this.args);
        this.process.stdout.addListener('data', function(data) {
            this.emit('stdout', data);
            process.stdout.write(data);
        }.bind(this));
        this.process.stderr.addListener('data', function(data) {
            this.emit('stderr', data);
            process.stderr.write(data);
        }.bind(this));
        this.process.addListener('exit', function(code) {
            util.debug('[springbokjs-daemon] exited (status='+code+')');
            this.process = null;
            if (this.restarting) {
                this.start();
            }
        }.bind(this));
    },

    stop: function() {
        this.restarting = false;
        if (this.process) {
            this.process.kill();
        }
    },

    restart: function() {
        if (this.process) {
            util.debug('[springbokjs-daemon] Stopping for restart');
            this.restarting = true;
            this.process.kill();
        } else {
            this.start();
        }
    }
};

SpringbokDaemon.prototype.start = prototype.start;
SpringbokDaemon.prototype.stop = prototype.stop;
SpringbokDaemon.prototype.restart = prototype.restart;

module.exports = function(command, args) {
    return new SpringbokDaemon(command, args);
};

module.exports.node = function(args) {
    return module.exports('node', args);
}