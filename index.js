var child_process = require('child_process');
var sys = require("sys");

module.exports = function(command, args) {
    return {
        process: null,
        restarting: false,

        restart: function() {
            if (this.process) {
                sys.debug('[springbokjs-dameon] Stopping for restart');
                this.restarting = true;
                this.process.kill();
            } else {
                this.start();
            }
        },

        start: function() {
            sys.debug('[springbokjs-dameon] Starting');
            var t=this;
            this.stop();

            t.process = child_process.spawn('node', args);
            t.process.stdout.addListener('data', function(data){
                process.stdout.write(data);
            });
            t.process.stderr.addListener('data', function(data){
                sys.print(data);
            });
            t.process.addListener('exit', function(code){
                sys.debug('[springbokjs-dameon] exited (status='+code+')');
                t.process = null;
                if (t.restarting) {
                    t.start();
                }
            });
        },

        stop: function() {
            this.restarting = false;
            if (this.process) {
                this.process.kill();
            }
        }
    };
};

module.exports.node = function(args) {
    return module.exports('node', args);
}