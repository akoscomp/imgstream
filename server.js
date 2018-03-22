const express = require('express');
const app = express();
const http = require('http').Server(app);

var io = require('socket.io').listen(http);
var fs = require('fs'); //require for file serving
var ejs = require('ejs');

var users = [];
var connections = [];
var vmnumber = 8;

const imgFolder = '/nfs/nfs/imgstream/images/';
const imgList = fs.readdirSync(imgFolder);

http.listen(3000, function() {
  console.log('Server running... on port 3000');
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(imgFolder));

io.sockets.on('connection', function(socket) {
console.log("start1");
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  //send file list to browser
  socket.emit('imgList', { message: imgList });

  // Diconnect
  socket.on('disconnect', function(data) {
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected %s sockets connected', connections.length);
  });

  function readMyFile(str) {
    fs.readFile(imgFolder + str, function(err, buf) {
      //it's impossible to ebed binary data
 //     console.log("Emit " + str);
      socket.emit(str, { image: true, buffer: buf.toString('base64') });
      console.log('image file is initialized: ' + imgFolder + str);
    });
  }

  imgList.forEach(file => {
    //console.log("send to readMyFile" + file);
    readMyFile(file);
  })
});

// watch file modification and on modification send the updated version
function watchMyFile(str) {
  var watch = require('node-watch');
  watch(imgFolder + str, function(evt, filename) {
    if (evt === 'update') {
      fs.readFile(imgFolder + str, function(err, buf) {
        for (var i = 0; i < connections.length; i++) {
          //it's impossible to embed binary data
          connections[i].emit(str, { image: true, buffer: buf.toString('base64') });
          console.log('image updated: ' + __dirname + '/images/' + str );
        }
      });
    }
  });
  var watchnew = require('node-watch');
  watchnew([imgFolder + str], console.log);
}

//set watcher to each file
imgList.forEach(file => {
  //console.log(file);
  watchMyFile(file);
})

//console.log("flist: " + imgList)

