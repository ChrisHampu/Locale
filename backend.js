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
		});
	});

	// When the client emits 'join', this listens and executes
	socket.on('join', function(user){
		var newUser = JSON.parse(user);
	
		newUser["location"]["latitude"] = newUser["location"]["lat"];
		delete newUser["location"]["lat"];

		newUser["location"]["longitude"] = newUser["location"]["lon"];
		delete newUser["location"]["lon"];

		console.log(newUser);

		// Store the username in the socket session for this client
		socket.username = newUser.firstName;
		socket.user = newUser;

		// Calculate the active rooms for this user and push them
		world.getAllowedRoomNames(newUser.location.latitude, newUser.location.longitude, function(allowedRooms) {

			var usersRooms = allRooms.map( function (obj) { 
				
				createCounter(obj.name);
				//obj.userCount = userCounts[obj.name];

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
			radius: '1000',
			owner: socket.user.profileUrl,
			tags: data.tags
		}

		world.addRoom(newRoom, function() {
			// Calculate the new active rooms for this user and push them
			world.getAllowedRoomNames(socket.user.location.latitude, socket.user.location.longitude, function(allowedRooms) {

				var usersRooms = allRooms.map(function(obj){ 

					obj.userCount = 0

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
	})

	// listener, client asks for updaterooms, server sends back the list of rooms
	socket.on('updaterooms', function (data) {
		// Calculate the active rooms for this user and push them
		// Calculate the active rooms for this user and push them
		world.getAllowedRoomNames(newUser.location.lat, newUser.location.lon, function(allowedRooms) {

			var usersRooms = allRooms.map(function(obj){ 

				createCounter(obj.name);
				obj.userCount = userCounts[obj.name];

				if (allowedRooms.indexOf(obj.name) > -1) {
					obj.canJoin = true;
				} else {
					obj.canJoin = false;
				}

				console.log(obj);

				return obj;
			});

			console.log(usersRooms);

			socket.emit('updaterooms', usersRooms);
		});
	})
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		var message = {
			"room": data.room,
			"firstName": socket.user.firstName,
			"lastInitial": socket.user.lastName.charAt(0),
			"profileUrl": socket.user.profileUrl,
			"message": data.message
		};

		// Plain message goes in, after it's persisted processedMessage has a timestamp
		world.persistMessage(message, function(processedMessage) {
			io.sockets.emit('broadcastchat', processedMessage);
		});

	});
	
	socket.on('switchRoom', function(newroom){
		switchRoom(socket, newroom);
	});

	socket.on('deletelocale', function(room){
		console.log(room);

		world.deleteRoom(room);
	});

	socket.on('joinroom', function(room){
		socket.join(room);

		incrementCount(room);


		world.getRoomHistory(room, function(messages) {
			socket.emit('loadroom', {"room": room, "messages": messages});
		})
	});

	// listen to users leaving rooms
	socket.on('leaveroom', function(room){
		socket.leave(room);

		userCounts[room]--;
	});
	
	socket.on('disconnect', function(){
		socket.leave(socket.room);
	});

});

function createCounter(room) {
	if (userCounts.indexOf(room) > -1) {
		// Do nothing
	} else {
		userCounts.push({room: 0})
	}
}

function incrementCount(room) {
	if (userCounts.indexOf(room) > -1) {
		userCounts[room]++;
		console.log(room, userCounts[room]);
	} else {
		userCounts[room] = 1;
		console.log(room, "Created count 1");
	}

	console.log(userCounts);
}

function decrementCount(room) {
	if (userCounts.indexOf(room) > -1) {
		if (userCounts[room] > 0) {
			userCounts[room]--;
		}
	} else {
		userCounts.push(room);
		userCounts[room] = 0;
	}
}
