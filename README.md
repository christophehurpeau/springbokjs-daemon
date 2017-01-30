# springbokjs-daemon [![NPM version][npm-image]][npm-url]

Springbok Daemon, usable with Gulp and Grunt to restart your server on watch

[![Dependency ci Status][dependencyci-image]][dependencyci-url]
[![Dependency Status][daviddm-image]][daviddm-url]

## Install

```bash
npm install --save-dev springbokjs-daemon
```

## API

All arguments are optional, but you should at least provide `command` or `args`.

```js
import createDaemon from 'springbokjs-daemon';

const daemon = createDaemon({
  key: '', // logger key
  displayName: '', // logger displayName
  command: 'node', // default to process.argv[0]
  args: [],
  autorestart: false, // autorestart when the child kills itself
  SIGTERMTimeout: 4000, // time to wait before sending SIGKILL
});

daemon.start(); // returns a Promise on the event ready
daemon.restart(); // do stop() then start()
daemon.stop(); // send SIGTERM then SIGKILL and returns a Promise when the child is killed.
```

## Message

You can send these messages [using process.send](https://nodejs.org/api/process.html#process_process_send_message_sendhandle_options_callback):
- ready: to notify that the instance has successfully started
- restart: ask for a clean restart of the process

## Use case with Gulp

```js
var gulp = require('gulp');
var createDaemon = require('springbokjs-daemon');

var daemon = createDaemon({ args: ['src/server/server.js'] });
process.on('exit', function(code) {
    daemon.stop();
});

gulp.task('watch', ['default'], function() {
    daemon.start();
    gulp.watch('src/server/**/*.js').on('change', function() {
        daemon.restart();
    });
});
```

[npm-image]: https://img.shields.io/npm/v/springbokjs-daemon.svg?style=flat-square
[npm-url]: https://npmjs.org/package/springbokjs-daemon
[daviddm-image]: https://david-dm.org/christophehurpeau/springbokjs-daemon.svg?style=flat-square
[daviddm-url]: https://david-dm.org/christophehurpeau/springbokjs-daemon
[dependencyci-image]: https://dependencyci.com/github/christophehurpeau/springbokjs-daemon/badge?style=flat-square
[dependencyci-url]: https://dependencyci.com/github/christophehurpeau/springbokjs-daemon
