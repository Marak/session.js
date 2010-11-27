var http = require('http'),
    session = require('./lib/core').session, 
    eyes = require('eyes');



// MOVE THIS MONKEY PATCH TO CORE.JS

http.createServer = function (requestListener) {

  // Create a new instance of a node HttpServer
  eyes.inspect(requestListener);
  var orig = new http.Server(function(request, response){

    session(request, response, function(request, response){
      requestListener(request, response);
    });
  });

  // Monkey punch the http server
  var server = Object.create(orig);
  
  server.listen = function (port) { 
    orig.listen(Number(port)); 
  };

  return server;
};


// let's create a basic http server!
http.createServer(function (request, response) {

  // after the session middleware has executed, let's finish processing the request
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write('hello, i know nodejitsu. \n' + 'the current session for this request looks like: \n' + JSON.stringify(request.session, 2, true));
  response.end();

}).listen(8080);

/* server started */  
console.log('> hello world running on port 8080');
