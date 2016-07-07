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
        var speed = config.speed;
        var voiceId = null;
        var voiceUrl = null;
        var playOrder = '';
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
            playOrder = 'play '+msg.payload;
            if(speed){
                playOrder+=' speed '+speed;
            }
            //保存声音标志，用来判断播放完成的声音是否是本应用的声音
            voiceId = 'freetalk'+new Date().getTime();
            voiceUrl = msg.payload;
            duty.exec((playOrder),
            function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
                num-=1;
                if(num<1){
                    nodethis.status({});
                }else{
                    text = num+" recogniting";
                    nodethis.status({fill:fill,shape:shape,text:text});
                }
                node.send(msg);
            });
        });
    }
    RED.nodes.registerType("play-voice",PlayVoice);
}