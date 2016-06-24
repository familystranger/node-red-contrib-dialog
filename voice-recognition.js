
/**
 * Created by Father on 2016/6/16.
 */
'use strict'
module.exports = function(RED) {
    var redis = require("redis");
    var request = require('request');
    var fs = require('fs');
    const EventEmitter = require('events');
    function VoiceRecognition(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var payload = "";
        var myEmitter = new EventEmitter();
        var client = redis.createClient();
        this.on('input', function(msg) {
            client.hgetall("baiduConfig", function (err, obj) {
                client.quit();
                if (err) console.log(err) ;
                let voicePath = msg.payload;
                console.log('voicePath',voicePath);
                myEmitter.on('readFile', (tok) => {
                fs.readFile(voicePath,function(err,data){
                    var len = data.length;
                    var cuid = 'baidu_workshop';
                    var format = 'wav';
                    var rate = 16000;
                    var channel = 1;
                    var token = tok;
                    var speech = data.toString('base64');
                    var body ={
                        'format':format,'rate':rate,'channel':channel,'token':token,'cuid':cuid,'len':len,'speech':speech
                    };
                    myEmitter.emit('getWorld',body);
                    });
                });

                myEmitter.on('getWorld',(body) => {

                    var options = {
                        url: 'http://vop.baidu.com/server_api',
                        headers: {
                            'Content-Type':'application/json'
                        },
                        body:JSON.stringify(body)
                    };
                    function callback(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var info = JSON.parse(body);
                            msg.payload ="没有听清您说什么，可以再说一遍吗";//默认回复
                            var result=info['result'];
                            if(result.length>0){
                                console.log(result.length);
                                msg.payload = result[0];
                            }
                            node.send(msg);
                        }
                    }

                    request(options, callback);
                })

                request('https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id='+obj['APIKey']+'&client_secret='+obj['secretKey'], function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        //console.log(JSON.parse(body)['access_token']);
                        let access_token = JSON.parse(body)['access_token'];
                        //console.log(access_token);
                        myEmitter.emit('readFile',access_token);
                    }
                })
            });
        });
    }
    RED.nodes.registerType("voice-recognition",VoiceRecognition);
}