
/**
 * Created by Father on 2016/6/16.
 */
'use strict'
module.exports = function(RED) {
    var request = require('request');
    var fs = require('fs');
    var redis = require("redis");
    function SpeechSynthesizer(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var client = redis.createClient();
        var payload = "";
        this.on('input', function(msg) {
            client.hgetall('baiduConfig',function(err,obj){
                client.quit();
                if(!obj){
                    msg.payload="未查找到配置信息";
                    node.send(msg)
                }
                let d = msg.payload;
                msg.payload = __dirname+'/'+msg.payload+'.mp3';
                d=encodeURIComponent(d);
                request('https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id='+obj['APIKey']+'&client_secret='+obj['secretKey'], function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    //console.log(JSON.parse(body)['access_token']);
                    let access_token = JSON.parse(body)['access_token'];
                    let audioUrl ='http://tsn.baidu.com/text2audio?tex='+d+'&lan=zh&tok='+access_token+'&ctp=1&cuid=12345649651489489561651153516511616';
                    request(audioUrl)
                        .on('error', function(err) {
                            console.log(err)
                        })
                        .pipe(fs.createWriteStream(msg.payload).on('finish',function() {
                            node.send(msg);
                        }))
                    }
                })
            })
        });
    }
    RED.nodes.registerType("speech-synthesizer",SpeechSynthesizer);
}