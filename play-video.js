/**
 * Created by Father on 2016/6/16.
 */
module.exports = function(RED) {
    var duty = require('child_process');
    function PlayVoice(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var name = config.name;
        this.on('input', function(msg) {
            node.warn(name+' begin play');
            duty.exec(('play '+msg.payload),
            function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
        });
    }
    RED.nodes.registerType("play-voice",PlayVoice);
}