var http = require('http'), 
    io = require('socket.io'),    // Let's use socket.io now
    fs = require('fs');           // Let's serve an HTML file from the file system now.
    path = require('path');       // For dealing with file paths when serving files

// Importing slightly edited Flapjax version to work on the server
require('./flapjax_server.js');
// Test if it works	
console.log("Attempting to create event stream to check if Flapjax works...");
console.log(receiverE());
console.log("Event stream printed? Should work then!");

var server = http.createServer(function (request, response) {
	// Serving files is now not hard coded anymore (except for chat.html)
	// because we need to serve some JavaScript-libraries.
  	var filePath = '.' + request.url;
	if (filePath == './') filePath = './collabEdit.html';
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	
	switch (extname) {
	  case '.js':
	    contentType = 'text/javascript';
	    break;
	       // We could add other branches here, e.g. to check for CSS or other types of files
	}

	path.exists(filePath, function(exists) {
      if (exists) {
	    fs.readFile(filePath, function(error, content) {
	      if (error) {
	        response.writeHead(500);
	        response.end();
	      } else {
	        response.writeHead(200, { 'Content-Type': contentType });
	        response.end(content, 'utf-8');
	      }
	    });
	  } else {
		response.writeHead(404);
	    response.end();
	  }
    });	
});

server.listen(8888);

var socket = io.listen(server);

var chatMessages = new Array();
var clients = new Array();

socket.on('connection', function(client) {
  clients.push(client);
  for (i = 0; i < chatMessages.length; i++) {
    client.emit('message', chatMessages[i]);
  }

  client.on('message', function(message) {
	chatMessages.push(message);
    for (i = 0; i < clients.length; i++) {
	  clients[i].emit('message', message);
    }
  });
});


console.log('Server running at http://localhost:8888/');