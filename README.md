# session.js - super simple session management for node.js


## Installation

### Installing npm (node package manager)
<pre>
  curl http://npmjs.org/install.sh | sh
</pre>

### Installing session.js
<pre>
  npm install sesh
</pre>

### Usage

#### Regular Sessions With httpServer

      var http = require('http'), 
          session = require('./lib/core').session;

      // let's create a basic http server!
      http.createServer(function (request, response) {

        // before we process any part of the request, let's give use the session middle-ware!
        session(request, response, function(request, response){

          // now we can access request.session

          // after the session middleware has executed, let's finish processing the request
          response.writeHead(200, {'Content-Type': 'text/plain'});
          response.write('hello, i know nodejitsu. \n' + 'the current session for this request looks like: \n' + JSON.stringify(request.session, 2, true));
          response.end();
    
        });

      }).listen(8080);

      /* server started */  
      console.log('> hello world running on port 8080');


#### Magic Monkey Punched Sessions (automatically patches httpServer)

    var http = require('http'),
        session = require('./lib/core').magicSession(); // special magic, now all requests have sessions!

    // let's create a basic http server!
    http.createServer(function (request, response) {

      // now we can access request.session

      // after the session middleware has executed, let's finish processing the request
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.write('hello, i know nodejitsu. \n' + 'the current session for this request looks like: \n' + JSON.stringify(request.session, 2, true));
      response.end();

    }).listen(8080);

    /* server started */  
    console.log('> hello world running on port 8080');
    
    
# Requirements 

     npm install response
     
# Authors

     inimino@inimino.org, Marak Squires

