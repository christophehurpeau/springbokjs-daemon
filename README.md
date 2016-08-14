# springbokjs-daemon [![NPM version][npm-image]][npm-url]

Springbok Daemon, usable with Gulp and Grunt to restart your server on watch

[![Dependency Status][daviddm-image]][daviddm-url]


## Install

```sh
npm install --save springbokjs-daemon
```

or

```
npm install --save-dev springbokjs-daemon
```

## Use case

```js
var gulp = require('gulp');
var daemon = require('springbokjs-daemon').node([ 'src/server/server.js' ]);
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
[daviddm-image]: https://david-dm.org//springbokjs-daemon.svg?style=flat-square
[daviddm-url]: https://david-dm.org//springbokjs-daemon
