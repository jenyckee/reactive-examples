var http = require('http');						// HTTP server
var url = require("url");						// Parsing URL requests
var querystring = require("querystring");		// More request parsing

var chatMessages = new Array();

// SUPER UGLY
function generateChatPage() {
	var result = '<html>'+
	    '<head>'+
	    '<meta http-equiv="Content-Type" content="text/html; '+
	    'charset=UTF-8" />'+
	    '</head>'+
		'<body>';
	for (i = 0; i < chatMessages.length; i++) {
		result += '<div>' + chatMessages[i] + '</div>';
	}
	result += '<form action="/receiveMessage" method="post">'+
    	'<textarea name="text" rows="3" cols="60"></textarea>'+
    	'<input type="submit" value="Submit text" />'+
    	'</form>'+
    	'</body>'+
    	'</html>';
	return result;
}

// Request handlers
function start(response, data) {	
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(generateChatPage());
	response.end();
}

function receiveMessage(response, data) {
	var message = querystring.parse(data).text;
	chatMessages.push(message);
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(generateChatPage());
	response.end();	
}

// Request handlers stored in handle object
var handle = {}
handle["/"] = start;
handle["/start"] = start;
handle["/receiveMessage"] = receiveMessage;


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