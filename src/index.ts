import { spawn, ChildProcess } from 'child_process';
import { Readable as ReadableStream } from 'stream';
import gracefulKill from 'graceful-kill';
import Logger, { addConfig, Level } from 'nightingale';
import ConsoleLogger from 'nightingale-console';
import split from 'split';

addConfig({
  pattern: /^springbokjs-daemon/,
  handler: new ConsoleLogger(Level.INFO),
});

export interface Options<Messages = any> {
  key?: string;
  displayName?: string;
  prefixStdout?: boolean;
  outputKey?: string;
  outputDisplayName?: string;
  command?: string;
  args?: (string | number)[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  autoRestart?: boolean;
  SIGTERMTimeout?: number;
  onMessage?: (message: Messages) => void;
}

export interface Daemon {
  hasExited(): boolean;
  start(): Promise<void>;
  // eslint-disable-next-line no-restricted-globals
  stop(): Promise<void>;
  restart(): Promise<void>;
  sendSIGUSR2(): void;
}

export default function createDaemon({
  key,
  displayName,
  prefixStdout = false,
  outputKey = key,
  outputDisplayName = displayName,
  command = global.process.argv[0],
  args = [],
  cwd,
  env,
  autoRestart = false,
  SIGTERMTimeout = 4000,
  onMessage,
}: Options = {}): Daemon {
  let process: ChildProcess | null = null;
  let stopPromise: Promise<void> | void;
  const logger = new Logger(
    `springbokjs-daemon${key ? `:${key}` : ''}`,
    displayName,
  );
  logger.info('created', { command, args });

  const outputLogger = prefixStdout
    ? new Logger(
        `springbokjs-daemon${outputKey ? `:${outputKey}` : ''}`,
        outputDisplayName,
      )
    : undefined;

  const stop = (): Promise<void> => {
    if (!process) return Promise.resolve(stopPromise);

    const runningProcess = process;
    process = null;

    runningProcess.removeAllListeners();
    stopPromise = gracefulKill(runningProcess, SIGTERMTimeout).then(() => {
      stopPromise = undefined;
    });

    return stopPromise as Promise<void>;
  };

  const start = (): Promise<void> => {
    if (process) {
      throw new Error('Process already started');
    }

    return new Promise((resolve, reject) => {
      const stdoutOption = outputLogger ? 'pipe' : 'inherit';
      process = spawn(command, args as string[], {
        cwd,
        env,
        stdio: ['ignore', stdoutOption, stdoutOption, 'ipc'],
      });

      if (outputLogger) {
        const logStreamInLogger = (
          stream: ReadableStream | null,
          loggerLevel: Level,
        ): void => {
          if (!stream) return;
          stream.pipe(split()).on('data', (line: string) => {
            if (line.length === 0) return;
            if (line.startsWith('{') && line.endsWith('}')) {
              try {
                const json: object = JSON.parse(line);
                logger.log('', json, loggerLevel);
                return;
              } catch (err) {}
            }

            outputLogger.log(line, undefined, loggerLevel);
          });
        };

        logStreamInLogger(process.stdout, Level.NOTICE);
        logStreamInLogger(process.stderr, Level.ERROR);
      }

      process.on('exit', (code, signal) => {
        logger.warn('exited', { code, signal });
        process = null;
        if (autoRestart) {
          logger.debug('autorestart');
          start().then(resolve, reject);
        } else {
          reject();
        }
      });

      process.on('message', (message) => {
        if (message === 'ready') {
          logger.success('ready');
          if (onMessage) onMessage('ready');
          resolve();
        } else if (message === 'restart') {
          logger.notice('restarting...');
          stop().then(() => start());
        } else if (onMessage) {
          onMessage(message);
        } else {
          logger.notice('message', { message });
        }
      });
    });
  };

  return {
    hasExited(): boolean {
      return process === null;
    },

    start() {
      logger.notice('starting...');
      return start();
    },

    stop() {
      if (!process) logger.notice('stopping...');
      return stop();
    },

    restart() {
      logger.notice('restarting...');
      return stop().then(() => start());
    },

    sendSIGUSR2() {
      if (process) {
        process.kill('SIGUSR2');
      }
    },
  };
}
