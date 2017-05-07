var http = require('http');

var port = process.env.port || 443;
var server = http.createServer(function (request, response) {

});
server.listen(port, function () { console.log("Server is listening on port 443"); });

var chatServer = require('./lib/chat_server.js');
chatServer.listen(server);