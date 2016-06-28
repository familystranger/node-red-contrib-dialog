
/**
 * Created by Father on 2016/6/16.
 */
'use strict'
module.exports = function(RED) {
    var turing = require('turing-api');
    var redis = require("redis");
    function SemanticRecognition(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var payload = "";
        var num = 0;
        let fill = "red";
        let shape = "ring";
        let text = 'recognition';
        var nodethis = this;
        this.on('input', function(msg) {
            let client = redis.createClient();
            num +=1;
            if(num>0){
                fill = "green",shape="dot", text = num+" recogniting";
            }
            this.status({fill:fill,shape:shape,text:text});
            client.hgetall("turingConfig", function (err, obj) {
                client.quit();
                obj.text = msg.payload;
                turing(obj,function(data){
                    msg.payload=data;
                    num-=1;
                    if(num<1){
                        fill = "red",shape="ring", text = num+" recognition";
                    }else{
                        text = num+" recogniting";
                    }
                    nodethis.status({fill:fill,shape:shape,text:text});
                    node.warn('semantic-recognition');
                    node.send(msg);
                })
                client.quit();
            });
            
        });
    }
    RED.nodes.registerType("semantic-recognition",SemanticRecognition);
}