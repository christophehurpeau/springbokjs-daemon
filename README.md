<h3 align="center">
  springbokjs-daemon
</h3>

<p align="center">
  Springbok Daemon, usable with Gulp and Grunt to restart your server on watch
</p>

<p align="center">
  <a href="https://npmjs.org/package/springbokjs-daemon"><img src="https://img.shields.io/npm/v/springbokjs-daemon.svg?style=flat-square"></a>
</p>

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
process.on('exit', function (code) {
  daemon.stop();
});

gulp.task('watch', ['default'], function () {
  daemon.start();
  gulp.watch('src/server/**/*.js').on('change', function () {
    daemon.restart();
  });
});
```
