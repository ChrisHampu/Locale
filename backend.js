var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var db = require('orchestrate')('f3258a30-bca3-4567-9e60-d05422f4745f');

server.listen(8080, function(){
	var host = server.address().address;
    var port = server.address().port;

    console.log('Locale webserver launched at http://%s:%s', host, port);
});

var connectToRoom;

// routing
app.get('/chatconnect', function (req, res) {
	connectToRoom = req.query.room_id;
  	res.sendFile(__dirname + '/index.html');
});

app.get('/validRooms', function(req, res){
	var lat = req.query.lat;
	var lon = req.query.lon;
	World.getValidRooms(lat, lon, function (err, rooms) {  
    	res.send(rooms);
	});
});

// usernames which are currently connected to the chat
var usernames = {};

World = require("./Model/world.js")

var activeRooms = null;

World.getRooms(function (err, rooms) {  
    activeRooms = rooms;
});

console.log(activeRooms);

rooms = activeRooms;

// rooms which are currently available in chat
//var rooms = ['room1','room2','room3'];

io.sockets.on('connection', function (socket) {
	
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = 'room1';
		// add the client's username to the global list
		usernames[username] = username;
		// send client to room 1
		socket.join('room1');
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to room1');
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'room1');
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});
	
	socket.on('switchRoom', function(newroom){
		switchRoom(socket, newroom);
	});
	

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});

});

function switchRoom(socket, newroom){
	socket.leave(socket.room);
	socket.join(newroom);
	socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
	// sent message to OLD room
	socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
	// update socket session room title
	socket.room = newroom;
	socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
	socket.emit('updaterooms', rooms, newroom);
}

/*app.get('/add_room', function(req,res){
	var roomName = req.query.room;
	if(rooms.indexOf(roomName) != -1){
		res.send("Sorry name already exists");
	} else {
		rooms.push(roomName);
		switchRoom(socket, roomName);
		res.send("added room " + roomName);
	}
});*/

/*app.get('/add_room', function(req,res){
	var roomName = req.query.room;
	rooms.push(roomName);
	socket.emit('updaterooms', rooms, roomName);
	res.send("added Room" + roomName);
});

app.get('/join_chat', function(req,res){
	var roomName = req.query.room;
	rooms.push(roomName);
	socket.emit('updaterooms', rooms, roomName);
	res.send("added Room" + roomName);
});*/
