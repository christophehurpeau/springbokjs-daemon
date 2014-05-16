## springbokjs-daemon

Use this with grunt or gulp to restart your server on changes

### Install

```
npm install springbokjs-daemon --save
```

or

```
npm install springbokjs-daemon --save-dev
```

### Use case

```
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
