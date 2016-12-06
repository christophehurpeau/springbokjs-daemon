import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import Logger, { addConfig, levels } from 'nightingale/src';
import ConsoleLogger from 'nightingale-console/src';

addConfig({ key: 'springbokjs-daemon', handler: new ConsoleLogger(levels.INFO) });

type OptionsType = {|
  autorestart: ?boolean,
|};

class SpringbokDaemon extends EventEmitter {
  constructor(command, args, { autorestart }: OptionsType = {}) {
    super();
    this.command = command;
    this.args = args;
    this.process = null;
    this.stopPromise = null;
    this.logger = new Logger('springbokjs-daemon');
    this.logger.info(command + (args && (` ${args.join(' ')}`)));
    this.autorestart = autorestart || false;
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

    this.process.addListener('exit', (code, signal) => {
      this.logger.warn('Exited', { code, signal });
      this.process = null;
      if (this.autorestart) {
        this.logger.debug('Autorestart');
        this.start();
      }
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
    return this.stop().then(() => this.start());
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
