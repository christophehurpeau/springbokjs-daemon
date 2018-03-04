'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var child_process = require('child_process');
var gracefulKill = _interopDefault(require('graceful-kill'));
var split = _interopDefault(require('split'));
var Logger = require('nightingale');
var Logger__default = _interopDefault(Logger);
var ConsoleLogger = _interopDefault(require('nightingale-console'));

Logger.addConfig({ pattern: /^springbokjs-daemon/, handler: new ConsoleLogger(Logger.levels.INFO) });

var index = (({
  key,
  displayName,
  prefixStdout = false,
  command = global.process.argv[0],
  args = [],
  cwd,
  autoRestart = false,
  SIGTERMTimeout = 4000
} = {}) => {
  let process = null;
  let stopPromise = null;
  const logger = new Logger__default(`springbokjs-daemon${key ? `:${key}` : ''}`, displayName);
  logger.info('created', { command, args });

  const stop = () => {
    if (!process) return Promise.resolve(stopPromise);

    const runningProcess = process;
    process = null;

    runningProcess.removeAllListeners();
    return stopPromise = gracefulKill(runningProcess, SIGTERMTimeout).then(() => {
      stopPromise = null;
    });
  };

  const start = () => {
    if (process) {
      throw new Error('Process already started');
    }

    return new Promise((resolve, reject) => {
      const stdoutOption = prefixStdout ? 'pipe' : 'inherit';
      process = child_process.spawn(command, args, {
        cwd,
        stdio: ['ignore', stdoutOption, stdoutOption, 'ipc']
      });

      if (prefixStdout) {
        const logStreamInLogger = (stream, loggerType) => {
          stream.pipe(split()).on('data', line => {
            if (line.length === 0) return;
            if (line.startsWith('{') && line.endsWith('}')) {
              try {
                const json = JSON.parse(line);
                logger[loggerType]('', json);
                return;
              } catch (err) {}
            }

            logger[loggerType](line);
          });
        };

        logStreamInLogger(process.stdout, 'info');
        logStreamInLogger(process.stderr, 'error');
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

      process.on('message', message => {
        if (message === 'ready') {
          logger.success('ready');
          resolve();
        } else if (message === 'restart') {
          logger.info('restarting...');
          stop().then(() => start());
        } else {
          logger.info('message', { message });
        }
      });
    });
  };

  return {
    hasExited() {
      return process.exitCode !== null || process.signalCode !== null;
    },

    start() {
      logger.info('starting...');
      return start();
    },

    stop() {
      if (!process) logger.info('stopping...');
      return stop();
    },

    restart() {
      logger.info('restarting...');
      return stop().then(() => start());
    },

    sendSIGUSR2() {
      process.kill('SIGUSR2');
    }
  };
});

module.exports = index;
//# sourceMappingURL=index-node6.cjs.js.map
