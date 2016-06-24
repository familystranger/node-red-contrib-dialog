
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
        var client = redis.createClient();
        this.on('input', function(msg) {
            client.hgetall("turingConfig", function (err, obj) {
                client.quit();
                obj.text = msg.payload;
                turing(obj,function(data){
                    msg.payload=data;
                    node.send(msg);
                })
                client.quit();
            });
            
        });
    }
    RED.nodes.registerType("semantic-recognition",SemanticRecognition);
}