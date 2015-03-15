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

var allRooms = null;
var allRoomNames = null;

// users connected to each room
var userCounts = [];

var roomNames = null;

io.sockets.on('connection', function (socket) {

	// Pull all the available rooms on every connection to compare against rooms that a given user is permitted access to
	world.getRooms(function(rooms) {
		allRooms = rooms;

		allRoomNames = allRooms.map(function(obj) {
			return obj.name;
		})
	});

	// When the client emits 'join', this listens and executes
	socket.on('join', function(user){

		var newUser = JSON.parse(user);
	
		newUser["location"]["latitude"] = newUser["location"]["lat"];
		delete newUser["location"]["lat"];

		newUser["location"]["longitude"] = newUser["location"]["lon"];
		delete newUser["location"]["lon"];


		// TODO: Create or update the user's db entry
		//console.log(newUser);

		// Store the username in the socket session for this client
		socket.username = newUser.firstName;
		socket.user = newUser;


		// Calculate the active rooms for this user and push them
		world.getAllowedRoomNames(newUser.location.latitude, newUser.location.longitude, function(allowedRooms) {

			var usersRooms = allRooms.map(function(obj){ 
				if (!userCounts[obj.name]) {
					obj["users"] = 0
				} else {
					obj["users"] = userCounts[obj.name];
				}

				if (allowedRooms.indexOf(obj.name) > -1) {
					obj.canJoin = true;
				} else {
					obj.canJoin = false;
				}

				return obj;
			});


			socket.emit('updaterooms', usersRooms);
		});
	});

	// listener, add rooms to the database by user request
	socket.on('addroom', function (data) {

		var newRoom = {
			name: data.name,
			description: data.description,
			location: socket.user.location,
			radius: '1000'
		}

		world.addRoom(newRoom);
	})

	// listener, client asks for updaterooms, server sends back the list of rooms
	socket.on('updaterooms', function (data) {
		// Calculate the active rooms for this user and push them
		// Calculate the active rooms for this user and push them
		world.getAllowedRoomNames(newUser.location.lat, newUser.location.lon, function(allowedRooms) {

			var usersRooms = allRooms.map(function(obj){ 
				if (!userCounts[obj.name]) {
					obj["users"] = 0
				} else {
					obj["users"] = userCounts[obj.name];
				}

				if (allowedRooms.indexOf(obj.name) > -1) {
					obj.canJoin = true;
				} else {
					obj.canJoin = false;
				}

				return obj;
			});


			socket.emit('updaterooms', usersRooms);
		});
	})
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		var persistedMessage = {
			"room": data.room,
			"firstName": socket.user.firstName,
			"lastInitial": socket.user.lastName.charAt(0),
			"profileUrl": socket.user.profileUrl,
			"message": data.message
		};

		world.persistMessage(persistedMessage);

		io.sockets.in(data.room).emit('broadcastchat', persistedMessage);
	});
	
	socket.on('switchRoom', function(newroom){
		switchRoom(socket, newroom);
	});

	socket.on('joinroom', function(room){
		socket.join(room);

		userCounts[room]++;

		world.getRoomHistory(room, function(messages) {
			socket.emit('loadroom', {"room": room, "messages": messages});
		})

		var joinedMsg = {
			"room": room,
			"firstName": socket.user.firstName,
			"lastInitial": socket.user.lastName.charAt(0),
			"message": "has joined the Locale"
		};

		io.sockets.in(room).emit('broadcastchat', joinedMsg);
		// TODO: Add user to the list of people in the room
	});

	// listen to users leaving rooms
	socket.on('leaveroom', function(room){
		socket.leave(room);

		userCounts[room]--;

		var joinedMsg = {
			"room": room,
			"firstName": undefined,
			"lastInitial": undefined,
			"message": socket.user.firstName + " " + socket.user.lastName.charAt(0) + ". has left the Locale (" + userCounts[room] + " user(s) left)"
		};

		io.sockets.in(room).emit('broadcastchat', joinedMsg);
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

function switchRoom(socket, newroom) {
	socket.leave(socket.room);

	// sent message to OLD room
	socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
	// update socket session room title
	socket.room = newroom;
	socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
	
		// Calculate the active rooms for this user and push them
		world.getAllowedRoomNames(newUser.location.lat, newUser.location.lon, function(allowedRooms) {

			var usersRooms = allRooms.map(function(obj){ 
				if (!userCounts[obj.name]) {
					obj["users"] = 0
				} else {
					obj["users"] = userCounts[obj.name];
				}

				if (allowedRooms.indexOf(obj.name) > -1) {
					obj.canJoin = true;
				} else {
					obj.canJoin = false;
				}

				return obj;
			});


			socket.emit('updaterooms', usersRooms);
		});
}
