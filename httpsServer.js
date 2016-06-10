var https = require('https');
const fs = require('fs');
var port = process.env.PORT || 1324
const options = {
	key : fs.readFileSync('key.pem'),
	cert :fs.readFileSync('cert.pem')

};
https.createServer(options,function (req,res){
	res.writeHead(200);
	res.end('Hello world\n');
}).listen(port);
console.log("server is runnig at "+port);