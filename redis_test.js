var redis = require("redis"),
    client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
    console.log("Error " + err);
});
client.hmset("turingConfig",{
      "key": "b597b03051e7212e61bf7935aa846376",
      "uniqueId":"160501196716867",
      "secret":"fb1e65bd088b9aa5"
});
client.hmset('baiduConfig',{
    'AppID': 8276641,
    'APIKey': 'RIZWjfYrRQFAlVazG9lRTYhf',
    'secretKey': '55294dbc0b89f3b9f5b8511f6c8d613b'
});
client.hgetall("turingConfig", function (err, obj) {
    console.dir(obj);
});
client.hgetall('baiduConfig',function(err,obj){
    console.dir(obj);

})
client.on('end',function(){
    console.log("redis is end");
})