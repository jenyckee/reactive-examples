var http = require('http'),
    url = require("url"),  
    fs = require('fs');           // Let's serve an HTML file from the file system now.

var html = fs.readFileSync('chat-ajax.html').toString();

var chatMessages = new Array();

// Request handlers
function start(response, data) {	
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(html);
	response.end();
}

function returnMessages(response, data) {
	response.writeHead(200, {"Content-Type": "text/json"});
	response.write(JSON.stringify(chatMessages));
	response.end();
}

function receiveMessage(response, data) {
	var message = JSON.parse(data);
	chatMessages.push(message);
	return returnMessages(response, data);
}

// Request handlers stored in handle object
var handle = {}
handle["/"] = start;
handle["/start"] = start;
handle["/receiveMessage"] = receiveMessage;
handle["/messages"] = returnMessages;


// HTTP server handling incoming requests
http.createServer(function (request, response) {
  var pathname = url.parse(request.url).pathname;
  var postData = "";
  // We are expecting request data in UTF8
  request.setEncoding("utf8");
  // We asynchronously received a chunk of POSTed data
  request.addListener("data", function(postDataChunk) {
    postData += postDataChunk;
  });
  // We were asynchronously signalled that all data has been received.
  // So we process the request with the POSTed data.
  request.addListener("end", function() {
     if (typeof handle[pathname] === 'function') {
	    handle[pathname](response, postData);
	  } else {
	    console.log("No request handler found for " + pathname);
	    // HTTP header (3-digit code + content type)
    	response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not found");
		response.end();
	  }
  });

}).listen(8888);

console.log('Server running at http://localhost:8888/');