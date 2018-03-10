const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const users = {};
const connections = [];
let pastUsername = undefined;

server.listen(process.env.PORT || 3000);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//Create a new username for new users or get a username
function getUsername() {
  // If the user has a user name at the moment, then return their current username
  if(pastUsername !== undefined){
    userName = pastUsername;
  }
  // If the user does not have a username, create a new randomized username
  else{
    userName = 'user' + (Math.ceil(Math.random() * 280));
  }
  return userName;
}

io.on('connection', function(socket){
	connections.push(socket);
  console.log('New User Has Connected: %s sockets connected', connections.length);

  console.log(socket.id);

  const user = getUsername();

  users[socket.id] = user;
  io.sockets.emit('connections updated', Object.values(users));
  socket.emit('Your Username' + ' ' + users[socket.id]);

  //Disconnect
  socket.on('disconnect', function(data) {
  	 delete users[socket.id];
  	 io.sockets.emit('connections updated', Object.values(users));
  	 connections.splice(connections.indexOf(socket), 1);
  	 console.log('user disconnected: %s sockets connected', connections.length);
  }); 

  // Send Message
  socket.on('send message', function(data){
  	console.log(data);
  	io.sockets.emit('new message', {msg: data, user});
  });
});
