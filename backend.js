var express = require('express')
, app = express()
, http = require('http')
, server = http.createServer(app)
, io = require('socket.io').listen(server);

var db = require('orchestrate')('f3258a30-bca3-4567-9e60-d05422f4745f');

server.listen(80, function(){
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

app.get('/privacy', function (req, res) {
	//Loads index file.
	res.sendFile(__dirname + '/privacy.html');
});

/*
 * Open the main chat connection page
 */
app.get('/chat_connect', function (req, res) {
	connectToRoom = req.query.room_id;
	res.sendFile(__dirname + '/index.html');
});

app.get('/add_room', function(req, res){
	var name = req.query.name;
	World.addRoom(name, function(err, response){
		res.send(response);
	});

});

app.get('/main', function(req, res){
	res.sendFile(__dirname + '/main.html');
});

//
// "SUPERGLOBALS"
//
var World = require("./Model/world.js");
var world = new World(db);

var worldRooms = null;

// usernames which are currently connected to the chat
var usersLookingAtList = {};

var roomNames = null;

io.sockets.on('connection', function (socket) {
	
	world.getRooms(function(worldRooms) {
		rooms = worldRooms; 
		roomNames = rooms.map(function(obj){
			return obj["name"];
		})
	});


	// when the client emits 'join', this listens and executes
	socket.on('join', function(user){

		var newUser = JSON.parse(user);
	
		// Create or update the user's db entry
		console.log(newUser);

		// Store the username in the socket session for this client
		socket.username = newUser.firstName;
		socket.user = newUser;

		// Calculate the active rooms for this user and push them
		world.getValidRooms(newUser.location.lat, newUser.location.lon, function(worldRooms) {
			var usersRooms = worldRooms; 
			
			socket.emit('updaterooms', usersRooms);
		});
	});

	// listener, client asks for updaterooms, server sends back the list of rooms
	socket.on('updaterooms', function (data) {
		// Calculate the active rooms for this user and push them
		world.getValidRooms(userRoom.location.lat, userRoom.location.lon, function(worldRooms) {
			var usersRooms = worldRooms; 
			
			socket.emit('updaterooms', usersRooms);
		});
	})
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (room, message) {
		var persistedMessage = {
			"id": guid(),
			"room": room,
			"user": socket.username,
			"message": message
		};

		world.persistMessage(persistedMessage);

		io.sockets.in(room).emit('broadcastchat', persistedMessage);
	});
	
	socket.on('switchRoom', function(newroom){
		switchRoom(socket, newroom);
	});

	socket.on('joinroom', function(room){
		socket.join(room);
		socket.emit('updatechat', {"user": "system", "message": "Welcome to " + newroom});
		// TODO: Add user to the list of people in the room
	});

	socket.on('leaveroom', function(room){
		socket.leave(room);
	});
	

	socket.on('disconnect', function(){
		// remove the username from global usernames list
		//delete usernames[socket.username];
		// update list of users in chat, client-side
		//io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});

});

function switchRoom(socket, newroom){
	socket.leave(socket.room);
	socket.join(newroom);
	socket.emit('loadroom', [{"user": "System", "message": "Welcome to " + newroom}]);
	// sent message to OLD room
	socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
	// update socket session room title
	socket.room = newroom;
	socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
	
	// Calculate the new active rooms for this user and push them
	world.getValidRooms(socket.user.location.lat, socket.user.location.lon, function(worldRooms) {
		var usersRooms = worldRooms; 
		
		socket.emit('updaterooms', usersRooms);
	});
}

// Generates psuedo-guid's for chat messages and anything else we need them for
function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	s4() + '-' + s4() + s4() + s4();
}