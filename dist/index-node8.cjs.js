'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

const child_process = require('child_process');
const gracefulKill = _interopDefault(require('graceful-kill'));
const split = _interopDefault(require('split'));
const Logger = require('nightingale');
const Logger__default = _interopDefault(Logger);
const ConsoleLogger = _interopDefault(require('nightingale-console'));

Logger.addConfig({
  pattern: /^springbokjs-daemon/,
  handler: new ConsoleLogger(Logger.Level.INFO)
});
function createDaemon({
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
  onMessage
} = {}) {
  let process = null;
  let stopPromise;
  const logger = new Logger__default(`springbokjs-daemon${key ? `:${key}` : ''}`, displayName);
  logger.info('created', {
    command,
    args
  });
  const outputLogger = prefixStdout ? new Logger__default(`springbokjs-daemon${outputKey ? `:${outputKey}` : ''}`, outputDisplayName) : undefined;

  const stop = () => {
    if (!process) return Promise.resolve(stopPromise);
    const runningProcess = process;
    process = null;
    runningProcess.removeAllListeners();
    stopPromise = gracefulKill(runningProcess, SIGTERMTimeout).then(() => {
      stopPromise = undefined;
    });
    return stopPromise;
  };

  const start = () => {
    if (process) {
      throw new Error('Process already started');
    }

    return new Promise((resolve, reject) => {
      const stdoutOption = outputLogger ? 'pipe' : 'inherit';
      process = child_process.spawn(command, args, {
        cwd,
        env,
        stdio: ['ignore', stdoutOption, stdoutOption, 'ipc']
      });

      if (outputLogger) {
        const logStreamInLogger = (stream, loggerLevel) => {
          if (!stream) return;
          stream.pipe(split()).on('data', line => {
            if (line.length === 0) return;

            if (line.startsWith('{') && line.endsWith('}')) {
              try {
                const json = JSON.parse(line);
                logger.log('', json, loggerLevel);
                return;
              } catch (err) {}
            }

            outputLogger.log(line, undefined, loggerLevel);
          });
        };

        logStreamInLogger(process.stdout, Logger.Level.NOTICE);
        logStreamInLogger(process.stderr, Logger.Level.ERROR);
      }

      process.on('exit', (code, signal) => {
        logger.warn('exited', {
          code,
          signal
        });
        process = null;

        if (autoRestart) {
          logger.debug('autorestart');
          start().then(resolve, reject);
        } else {
          reject();
        }
      });
      process.on('message', message => {
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
          logger.notice('message', {
            message
          });
        }
      });
    });
  };

  return {
    hasExited() {
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
    }

  };
}

exports.default = createDaemon;
//# sourceMappingURL=index-node8.cjs.js.map
