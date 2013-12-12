var http = require('http');

http.createServer(function (req, res) {
  console.log('Incoming request: ' + req.url);

  var bodyParts = [];
  var bytes = 0;

  req.on('data', function (c) {
    bodyParts.push(c);
    bytes += c.length;
  });

  req.on('end', function () {
    var json, body;

    try {
      body = Buffer.concat(bodyParts, bytes).toString('utf8');
      json = JSON.parse(body);
      console.log(json);
    } catch (ex) {
      console.log(body);
    }
  });

  req.on('close', function () {
    console.log('req close');
  });

  req.on('error', function () {
    console.log('req error');
  });

  // content header
  res.writeHead(200, {
    'content-type': 'text/plain'
  });

  if (req.url === '/csp') {
    console.log('csp request made');
  }

  res.end();
}).listen(2600);
