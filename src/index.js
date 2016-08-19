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
        this.logger = new Logger('springbokjs-daemon');
        this.logger.info(command + (args && (` ${args.join(' ')}`)));
    }

    start() {
        if (this.process) {
            throw new Error('Process already started');
        }

        this.logger.info('Starting...');

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

    restartTimeout(timeout: number) {
        return setTimeout(() => this.restart(), timeout);
    }
}

export default function createDaemon(command, args) {
    return new SpringbokDaemon(command, args);
}

export const node = args => createDaemon('node', args);
createDaemon.node = node;
