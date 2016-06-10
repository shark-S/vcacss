
var websocket = require('ws').Server;
var http = require('http')
var express = require('express')
var app = express()
var port = process.env.PORT || 5000

app.use(express.static(__dirname+"/"))

var server = http.createServer(app)
server.listen(port)

console.log("http server is listening on %d",port)

var wss = new websocket({server:server})
console.log("websocket server created")
x = 0;
wss.broadcast = function (data){
		var i=0,n=this.clients?this.clients.length:0,client=null;
		for(;i<n;i++){
console.log("Clinet "+i+" Here");
			client = this.clients[i];
			if(client.readyState === client.OPEN){
				client.send(data);
				x++;
			}
			else console.error('Error:the client state is '+client.readyState);

		}
	};
	wss.on('connection',function(ws){


  console.log("websocket connection open")

  ws.on("close", function() {
    console.log("websocket connection close")
    clearInterval(id)
  })

		ws.on('message',function(message){
			wss.broadcast(message);
			console.log("websocket connection is open")
		});
	});