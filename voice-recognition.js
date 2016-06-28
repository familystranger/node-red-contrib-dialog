
/**
 * Created by Father on 2016/6/16.
 */
'use strict'
module.exports = function(RED) {
    var redis = require("redis");
    var request = require('request');
    var fs = require('fs');
    var co = require('co');
    const EventEmitter = require('events');
    function VoiceRecognition(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var payload = "";
        let num = 0;
        let fill = "red";
        let shape = "ring";
        let text = 'recognition';
        let nodethis = null;
        this.on('input', function(msg) {
            nodethis =this;
            num +=1;
            if(num>0){
                fill = "green",shape="dot", text = num+" recogniting";
            }
            this.status({fill:fill,shape:shape,text:text});
            let client = redis.createClient();
            co(function*(){
                let baiduConfig = yield new Promise((resolve,reject) => {
                    client.hgetall("baiduConfig", (err, obj) => {
                        client.quit();
                        if (err) console.log(err) ;
                        resolve(obj);
                    });
                });
                let accessToken = yield new Promise((resolve,reject) => {
                    // console.log()
                    request('https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id='+baiduConfig['APIKey']+'&client_secret='+baiduConfig['secretKey'], function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            let access_token = JSON.parse(body)['access_token'];
                            resolve(access_token);
                        }
                        console.log(error);
                    });
                });
                let requestBody = yield new Promise((resolve,reject) =>{
                    fs.readFile(msg.payload,function(err,data){
                    var len = data.length;
                    var cuid = 'baidu_workshop';
                    var format = 'wav';
                    var rate = 16000;
                    var channel = 1;
                    var token = accessToken;
                    var speech = data.toString('base64');
                    var body ={
                        'format':format,'rate':rate,'channel':channel,'token':token,'cuid':cuid,'len':len,'speech':speech
                    };
                    resolve(body);
                    });
                });
                let worlds = yield new Promise((resolve,reject) => {
                    let options = {
                        url: 'http://vop.baidu.com/server_api',
                        headers: {
                            'Content-Type':'application/json'
                        },
                        body:JSON.stringify(requestBody)
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
                            num-=1;
                            if(num<1){
                                fill = "red",shape="ring", text = num+" recognition";
                            }else{
                                text = num+" recogniting";
                            }
                            nodethis.status({fill:fill,shape:shape,text:text});
                            node.send(msg);
                            resolve('');
                        }
                    }
                    request(options, callback);
                });
            });
        });
    }
    RED.nodes.registerType("voice-recognition",VoiceRecognition);
}