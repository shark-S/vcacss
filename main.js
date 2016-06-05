var express = require('express')
var webRTC = require('webrtc.io').listen(8001);
var app = express();
app.get('*',function(req,res){
	res.sendfile('index.html');
})
