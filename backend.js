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

app.get('/ourstack', function (req, res) {
	//Loads index file.
	res.sendFile(__dirname + '/ourstack.html');
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

		// Store the username in the socket session for this client
		socket.username = newUser.firstName;
		socket.user = newUser;

		// Calculate the active rooms for this user and push them
		world.getAllowedRoomNames(newUser.location.latitude, newUser.location.longitude, function(allowedRooms) {

			var usersRooms = allRooms.map( function (obj) { 
				
				//createCounter(obj.name);
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
			tags: data.tags,
			userCount: 0,
			users: []
		};

		world.addRoom(newRoom, function() {
			allRooms.push(newRoom);
			allRoomNames.push(newRoom.name);

			// Calculate the active rooms for this user and push them
			world.getAllowedRoomNames(socket.user.location.latitude, socket.user.location.longitude, function(allowedRooms) {
			
				var usersRooms = allRooms.map(function(obj){ 

					if (obj.name == newRoom.name) {
						obj.canJoin = true;
					} else if (allowedRooms.indexOf(obj.name) > -1) {
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
		// Pull all the available rooms on every connection to compare against rooms that a given user is permitted access to
		world.getRooms(function(rooms) {
			allRooms = rooms;
			allRoomNames = allRooms.map(function(obj) {
				return obj.name;
			});

			// Calculate the active rooms for this user and push them
			world.getAllowedRoomNames(socket.user.location.latitude, socket.user.location.longitude, function(allowedRooms) {
			
				var usersRooms = allRooms.map(function(obj){ 
			
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
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		var message = {
			"room": data.room,
			"firstName": socket.user.firstName,
			"lastInitial": socket.user.lastName.charAt(0),
			"profileUrl": socket.user.profileUrl,
			"message": data.message.slice(0,200)
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
		world.deleteRoom(room);
	});

	socket.on('joinroom', function(roomName){

		world.getRoomByName(roomName, function(room) {
			socket.join(roomName);

			room.userCount++;

			var newUser = { profileUrl: socket.user.profileUrl,
					firstName: socket.user.firstName,
					lastInitial: socket.user.lastName.charAt(0)
			};

			room.users.push(newUser);
			
			world.addUserToRoom(roomName, newUser);
			
			world.getRoomHistory(roomName, function(messages) {
				socket.emit('loadroom', {"room": roomName, "messages": messages, "users" : room.users, "userCount" : room.userCount});
			});
			
			console.log("Joined room: " + room.name);
		});
	});

	// listen to users leaving rooms
	socket.on('leaveroom', function(roomName){
	
		world.getRoomByName(roomName, function(room) {
			socket.leave(roomName);
			
			var idx = -1;
			
			for(var i = 0; i < room.users.length; i++)
				if(socket.user.profileUrl === room.users[i].profileUrl)
					idx = i;
			
			room.users = room.users.splice(idx, 1);
			
			world.getRoomHistory(roomName, function(messages) {
				socket.emit('loadroom', {"room": roomName, "messages": messages, "users" : room.users, "userCount" : room.users.length});
			});
			
			console.log("Left room room: " + room.name);
			
			world.updateRoomUsers(roomName, room.users, room.users.length);
		});
	});
	
	socket.on('disconnect', function(){

		if(socket.user !== undefined)
			world.getRoomsByUser(socket.user, function(rooms) {
				world.removeUserFromRooms(socket.user, rooms);
			});
	});

});