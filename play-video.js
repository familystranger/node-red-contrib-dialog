/**
 * Created by Father on 2016/6/16.
 */
'use strict'
module.exports = function(RED) {
    var duty = require('child_process');
    function PlayVoice(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var name = config.name;
        let num = 0;
        let fill = "red";
        let shape = "ring";
        let text = 'recognition';
        let nodethis = null;
        this.on('input', function(msg) {
            nodethis = this;
            num +=1;
            if(num>0){
                fill = "green",shape="dot", text = num+" recogniting";
            }
            node.warn(name+' begin play');
            duty.exec(('play '+msg.payload),
            function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
                num-=1;
                if(num<1){
                    fill = "red",shape="ring", text = num+" recognition";
                }else{
                    text = num+" recogniting";
                }
                nodethis.status({fill:fill,shape:shape,text:text});
            });
        });
    }
    RED.nodes.registerType("play-voice",PlayVoice);
}