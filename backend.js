var express = require('express')
, app = express()
, http = require('http')
, server = http.createServer(app)
, io = require('socket.io').listen(server);

var couchbase = require('couchbase');

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

//
// "SUPERGLOBALS"
//
var CouchDB = require("./Model/couch.js");
var Couch = new CouchDB(couchbase);

var allRooms = null;

io.sockets.on('connection', function (socket) {

	// Pull all the available rooms on every connection to compare against rooms that a given user is permitted access to
	world.getRooms(function(rooms) {
		allRooms = rooms;
	});

	// When the client emits 'join', this listens and executes
	socket.on('join', function(user){
		var newUser = JSON.parse(user);

		// Store the username in the socket session for this client
		socket.username = newUser.firstName;
		socket.user = newUser;

		// Persist the user in the database, and return the key for the user data
		Couch.persistUser(user, function(userKey) {

			Couch.getAllLocales( function(locales) {

				Couch.getAllLocalesInRange(userKey, function(localesInRange) {

					var updatedLocales = locales.map(function (locale) {

						var join = !(localesInRange.indexof(locale.name) === -1);

						// Put together the data that we want clients to receive
						return {
							name: locale.name,
							description: locale.description,
							location: locale.location,
							radius: locale.radius,
							tags: locale.tags,
							canJoin: join
						};
					});

					socket.emit('updaterooms', updatedLocales);
				});
			});
		});
	});

	// listener, add rooms to the database by user request
	socket.on('addroom', function (data) {

		var newRoom = {
			name: data.name,
			description: data.description,
			location: socket.user.location,
			radius: 1000,
			owner: socket.user.profileUrl,
			tags: data.tags,
			userCount: 0,
			users: [],
			messages: []
		};

		world.addRoom(newRoom, function() {
			allRooms.push(newRoom);

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
			"profilePicture": socket.user.profilePicture,
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
		// Tell all our users that a locale has been deleted
		io.sockets.emit('deletelocale', room);
	});

	// TODO: Check for duplicate users.
	// Example: A user opens 2+ browser windows/apps and connects to the same room on each.
	// There would now be multiple entries.
	socket.on('joinroom', function(roomName){

		world.getRoomByName(roomName, function(room) {
			
			// We check whether a user already is part of this room. If they are,
			// then don't add them as another room user! This avoid duplicates
			// from a user joining the same room repeatedly without emitting first
			// that they are leaving the room. This happens by repeatedly pressing join,
			// because the client doesn't leave the room first.
			var idx = -1;
			
			for(var i = 0; i < room.users.length; i++)
			{
				if(socket.user.id === room.users[i].id)
					idx = i;
			}
			
			if(idx === -1)
			{			
				socket.join(roomName);
				
				room.userCount++;

				var newUser = { 
						profilePicture: socket.user.profilePicture,
						profileUrl: socket.user.profileUrl,
						firstName: socket.user.firstName,
						lastName: socket.user.lastName,
						location: socket.user.location,	
						email: socket.user.email,
						id: socket.user.id
				}

				room.users.push(newUser);
				
				world.addUserToRoom(roomName, newUser);
			}
			
			world.getRoomHistory(roomName, function(messages) {
				socket.emit('loadroom', {"room": roomName, "messages": messages, "users" : room.users, "userCount" : room.userCount});
				// Tell all existing users that a new user has joined
				io.sockets.emit('updateroomusers', [{ name : room.name, users: room.users, userCount: room.userCount }]);
			});
		});
	});

	// listen to users leaving rooms
	// TODO: Only emit updates to the users who are actually connected to the room who has
	// a person leaving the room. Currently it emits updaterooms to ALL sockets which is
	// a privacy, security, and performance concern
	socket.on('leaveroom', function(roomName){
		
		world.getRoomByName(roomName, function(room) {

			var idx = -1;
			
			for(var i = 0; i < room.users.length; i++)
			{
				if(socket.user.id === room.users[i].id)
					idx = i;
			}
			
			if(idx > -1)
			{
				room.users = room.users.splice(idx, 1);
				room.userCount = room.users.length;
				
				var rooms = [ room ];
				
				socket.leave(roomName);
				
				world.removeUserFromRooms(socket.user, rooms, function(updatedRoom) {
					io.sockets.emit('updateroomusers', updatedRoom);
				});		
			}
		});
	});
	
	socket.on('disconnect', function(){

		if(socket.user !== undefined)
		{
			world.getRoomsByUser(socket.user, function(rooms) {
				world.removeUserFromRooms(socket.user, rooms, function(updatedRoom) {
					io.sockets.emit('updateroomusers', updatedRoom);
				});
			});
		}
	});

});