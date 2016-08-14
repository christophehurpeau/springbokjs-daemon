import { spawn } from 'child_process';
import Logger, { addConfig } from 'nightingale';
import ConsoleLogger from 'nightingale-console';
import { EventEmitter } from 'events';

addConfig({ key: 'springbokjs-daemon', handler: new ConsoleLogger() });

class SpringbokDaemon extends EventEmitter {
    constructor(command, args) {
        super();
        this.command = command;
        this.args = args;
        this.process = null;
        this.restarting = false;
        this.stopping = false;
        this.logger = new Logger('springbokjs-daemon');
        this.logger.info(command + (args && (` ${args.join(' ')}`)));
    }

    start() {
        this.stopping = false;
        this.logger.debug('Starting...');
        this.stop();

        this.process = spawn(this.command, this.args, { env: process.env });
        this.process.stdout.addListener('data', (data) => {
            process.stdout.write(data);
            this.emit('stdout', data);
        });
        this.process.stderr.addListener('data', (data) => {
            process.stderr.write(data);
            this.emit('stderr', data);
        });
        this.process.addListener('exit', (code) => {
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

    restartTimeout(timeout: number) {
        return setTimeout(() => this.restart(), timeout);
    }
}

export default function createDaemon(command, args) {
    return new SpringbokDaemon(command, args);
}

export const node = args => createDaemon('node', args);
createDaemon.node = node;
