
/**
 * Created by Father on 2016/6/16.
 */
'use strict'
module.exports = function(RED) {
    var request = require('request');
    var fs = require('fs');
    var co = require('co');
    var redis = require("redis");
    function SpeechSynthesizer(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var payload = "";
        let num = 0;
        let fill = "red";
        let shape = "ring";
        let text = 'recognition';
        let nodethis = null;
        this.on('input', function(msg) {
            var client = redis.createClient();
            nodethis = this;
            num +=1;
            if(num>0){
                fill = "green",shape="dot", text = num+" recogniting";
            }
            co(function*(){
                let baiduConfig = yield new Promise((resolve,reject) => {
                    client.hgetall('baiduConfig',function(err,obj){
                        client.quit();
                        if(!obj){
                            msg.payload="未查找到配置信息";
                            node.send(msg)
                        }
                        resolve(obj);
                    })
                });
                let accessToken = yield new Promise((resolve,reject) => {
                    request('https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id='+baiduConfig['APIKey']+'&client_secret='+baiduConfig['secretKey'], function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            
                            let access_token = JSON.parse(body)['access_token'];
                            resolve(access_token);
                        }
                    })
                });
                let getVoice = yield new Promise((resolve,reject) => {
                    let d=encodeURIComponent(msg.payload);
                    msg.payload = __dirname+'/'+msg.payload+'.mp3';
                    let audioUrl ='http://tsn.baidu.com/text2audio?tex='+d+'&lan=zh&tok='+accessToken+'&ctp=1&cuid=12345649651489489561651153516511616';
                    request(audioUrl)
                        .on('error', function(err) {
                            console.log(err)
                        })
                        .pipe(fs.createWriteStream(msg.payload).on('finish',function() {
                            num-=1;
                            if(num<1){
                                fill = "red",shape="ring", text = num+" recognition";
                            }else{
                                text = num+" recogniting";
                            }
                            nodethis.status({fill:fill,shape:shape,text:text});
                            node.send(msg);
                            resolve('');
                        }))
                })
            });
        });
    }
    
    RED.nodes.registerType("speech-synthesizer",SpeechSynthesizer);
}