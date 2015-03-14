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

app.use(express.static(__dirname + '/public'));


app.get('', function (req, res) {
	//Loads index file.
	res.sendFile(__dirname + '/locale.html');
});

// 
// ROUTING
//
app.post('/api/user_auth', function (req, res){

	var user = {
		email: req.body.email,
		name: req.body.name,
		fbToken: req.body.fbToken,
		location: {
			lat: req.body.location.lat,
			long: req.body.location.long,
		}
	};

	db.put('users', user.email, user).then(function (result) {
		return res.send(user);
	});
});


app.get('/chat_connect', function (req, res) {
	connectToRoom = req.query.room_id;
	res.sendFile(__dirname + '/index.html');
});

/*
 * Given a request object with Latitude and Longitude parameters
 * return the list of rooms that a user at this location can join
 */
app.get('/get_rooms', function(req, res){
	var lat = req.query.lat;
	var lon = req.query.lon;
	World.getValidRooms(lat, lon, function (err, rooms) {  
		res.send(rooms);
	});
});

app.get('/add_room', function(req, res){
	var name = req.query.name;
	World.addRoom(name, function(err, response){
		res.send(response);
	});

});

app.get('/main', function(req, res){
	res.sendFile(__dirname + '/mapview.html');
});

//
// "SUPERGLOBALS"
//
var World = require("./Model/world.js");
var world = new World(db);

var worldRooms = null;

// usernames which are currently connected to the chat
var usernames = {};

var roomNames = null;

io.sockets.on('connection', function (socket) {
	
	world.getRooms(function(worldRooms) {
		rooms = worldRooms; 
		roomNames = rooms.map(function(obj){
			return obj["name"];
		})
		// console.log(worldRooms);
	});


	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(userRoom){

		console.log(userRoom);

		// Get the user's list of nearby rooms
		world.getValidRooms(userRoom.location.lat, userRoom.location.lon, function(worldRooms) {
			rooms = worldRooms; 
			roomNames = rooms.map(function(obj){
				return obj["name"];
			})

			// store the username in the socket session for this client
			socket.username = userRoom.username;
			// store the room name in the socket session for this client
			socket.room = userRoom.room;
			// add the client's username to the global list
			usernames[userRoom.username] = userRoom.username;
			// send client to room 1
			socket.join('Room1');
			// echo to client they've connected
			socket.emit('updatechat', 'SERVER', 'you have connected to room1');
			// echo to room 1 that a person has connected to their room
			socket.broadcast.to('room1').emit('updatechat', 'SERVER', userRoom.username + ' has connected to this room');
			socket.emit('updaterooms', roomNames, 'room1');
		});

		
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);

		console.log(data);
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

