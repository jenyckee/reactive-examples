var http = require('http'), 
    io = require('socket.io'),    // Let's use socket.io now
    fs = require('fs');           // Let's serve an HTML file from the file system now.

var html = fs.readFileSync('chat.html').toString();

var server = http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.end(html);
});

server.listen(8888);

var socket = io.listen(server);

var chatMessages = new Array();
var clients = new Array();
var usernames = new Array();
var messageMap = new Array();

socket.on('connection', function(client) {
  clients.push(client);
  
  for (i = 0; i < chatMessages.length; i++) {
    var message = chatMessages[i];
    client.emit('message', message, usernames[messageMap[message]]);
  }
  
  client.on('username', function(name) {
    usernames[client] = name;
    console.log('Login '+name);
  });

  
  client.on('message', function(message) {
	chatMessages.push(message);
    messageMap[message]=client;
    for (i = 0; i < clients.length; i++) {
	  clients[i].emit('message', message, usernames[messageMap[message]]);
    }
  });
});

console.log('Server running at http://localhost:8888/');