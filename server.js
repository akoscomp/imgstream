var express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
var users = [];
var connections = [];
var vmnumber = 8;

var fs = require('fs'); //require for file serving

http.listen(process.env.PORT || 3000, function() {
  console.log('Server running... on port 3000');
});


//location to index.html
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  // Diconnect
  socket.on('disconnect', function(data) {
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected %s sockets connected', connections.length);
  });

 function readMyFile(str) {
  fs.readFile(__dirname + '/' + str + '.jpg', function(err, buf) {
    //it's impossible to ebed binary data
    console.log("Emit " + str)
    socket.emit(str, { image: true, buffer: buf.toString('base64') });
    console.log('image file is initialized: ' + __dirname + '/' + str + '.jpg');
  });
 }

 for (i = 1; i <= vmnumber; i++) {
   var str = "" + i;
   var pad = "000"
   var ans = "image" + pad.substring(0, pad.length - str.length) + str;
//   str = 'image00' + i;
   readMyFile(ans);
 }
});

function watchMyFile(str) {
    var watch = require('node-watch');
	watch(str + '.jpg', function(evt, filename) {
	  if (evt === 'update') {
		fs.readFile(__dirname + '/' + str + '.jpg', function(err, buf) {
		  for (var i = 0; i < connections.length; i++) {
			//it's impossible to ebed binary data
			connections[i].emit(str, { image: true, buffer: buf.toString('base64') });
			console.log('image file is initialized: ' + __dirname + '/' + str + '.jpg');
		  }
		});
	  }
	});
}
 for (i = 1; i <= vmnumber; i++) {
   var str = "" + i;
   var pad = "000"
   var ans = "image" + pad.substring(0, pad.length - str.length) + str;
//   str = 'image00' + i;
   watchMyFile(ans);
 }
