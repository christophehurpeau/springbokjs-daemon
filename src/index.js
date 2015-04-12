var childProcess = require('child_process');
var ConsoleLogger = require('springbokjs-logger/console');
var EventEmitter = require('events').EventEmitter;

class SpringbokDaemon extends EventEmitter {
    constructor(command, args) {
        super();
        this.command = command;
        this.args = args;
        this.process = null;
        this.restarting = false;
        this.logger = new ConsoleLogger();
        this.logger.setPrefix('springbokjs-daemon: ', this.logger.blue.bold);
        this.logger.debug(command + (args && (' ' + args.join(' '))));
    }

    start() {
        this.logger.debug('Starting');
        this.stop();

        this.process = childProcess.spawn(this.command, this.args);
        this.process.stdout.addListener('data', function(data) {
            process.stdout.write(data);
            this.emit('stdout', data);
        }.bind(this));
        this.process.stderr.addListener('data', function(data) {
            process.stderr.write(data);
            this.emit('stderr', data);
        }.bind(this));
        this.process.addListener('exit', function(code) {
            this.logger.debug('exited (status=' + code + ')');
            this.process = null;
            if (this.restarting) {
                this.start();
            }
        }.bind(this));
    }

    stop() {
        this.restarting = false;
        if (this.process) {
            this.process.kill();
        }
    }

    restart() {
        if (this.process) {
            this.logger.debug('Stopping for restart');
            this.restarting = true;
            this.process.kill();
        } else {
            this.start();
        }
    }
}

var createDaemon = function(command, args) {
    return new SpringbokDaemon(command, args);
};

export default createDaemon;

createDaemon.node = function(args) {
    return createDaemon('node', args);
};
