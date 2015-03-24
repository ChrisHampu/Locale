var express = require('express')
, app = express()
, http = require('http')
, server = http.createServer(app)
, io = require('socket.io').listen(server)
, couchbase = require('couchbase');

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

var InDev = true;

// Live server will be passed this by command line to signal we're in production
process.argv.forEach(function(val, index, array) {
	if(val === "production") {
		InDev = false;
		console.log("Running in production mode");
	}
});

if(InDev === true)
	console.log("Running in development mode");

var CouchDB = require("./Model/couch.js");
var Couch = new CouchDB(couchbase, InDev);

io.sockets.on('connection', function (socket) {

	// When the client emits 'join', this listens and executes
	socket.on('join', function(user){
		var newUser = JSON.parse(user);

		// Store the username in the socket session for this client
		socket.username = newUser.firstName;
		socket.user = newUser;

		// Persist the user in the database, and return the key for the user data
		Couch.persistUser(newUser, function(userKey) {

			Couch.getAllLocales( function(locales) {

				Couch.getAllLocalesInRange(newUser, 1000.0, function(localesInRange) {

					var updatedLocales = locales.map(function (locale) {

						var join = !(localesInRange.indexOf(locale.name) === -1);

						// Put together the data that we want clients to receive
						return {
							name: locale.name,
							description: locale.description,
							location: locale.location,
							radius: locale.radius,
							tags: locale.tags,
							userCount: locale.users.length,
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

		if(socket.user === undefined)
			return;

		var newLocale = {
			name: data.name,
			description: data.description,
			location: socket.user.location,
			radius: 1000,
			owner: "user_" + socket.user.id.toString(),
			tags: data.tags,
			users: [],
			messages: [],
			type: "locale",
			creationDate: Math.floor(new Date())
		};

		Couch.persistLocale(newLocale, function(exists) {

			if(exists === false)
			{
				for(var i in io.sockets.connected) {

					var curSocket = io.sockets.connected[i];

					if(curSocket.user === undefined)
						continue;

					Couch.getAllLocales( function(locales) {

						Couch.getAllLocalesInRange(curSocket.user, 1000, function(localesInRange) {

							var updatedLocales = locales.map(function (locale) {

								var join = !(localesInRange.indexOf(locale.name) === -1);

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
				}				
			}
			else
			{
				console.log("Locale name taken");
				// TODO: Notify user that locale name is taken
			}
		});
	})

	// listener, client asks for updaterooms, server sends back the list of rooms
	socket.on('updaterooms', function (data) {
		// Pull all the available rooms on every connection to compare against rooms that a given user is permitted access to
		/*
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
*/
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {;
		var message = {
			"locale": "locale_" + data.room,
			"firstName": socket.user.firstName,
			"lastInitial": socket.user.lastName.charAt(0),
			"profilePicture": socket.user.profilePicture,
			"profileUrl": socket.user.profileUrl,
			"message": data.message.slice(0,200),
			"timestamp": Math.floor(new Date())
		};

		Couch.persistChatMessage(data.room, socket.user.id, message, function() {
			
			// Prepare for sending back to user
			message.room = data.room;
			delete message.locale;

			io.sockets.emit('broadcastchat', message);
		});
	});
	
	socket.on('switchRoom', function(newroom){
		switchRoom(socket, newroom);
	});

	socket.on('deletelocale', function(room){

		if(socket.user === undefined)
			return;

		Couch.getLocaleByName(room, function(locale) {

			var userKey = "user_" + socket.user.id;

			if(locale.owner === userKey) {
				Couch.deleteLocale(room);

				// Tell all our users that a locale has been deleted
				io.sockets.emit('deletelocale', room);

			} else {
				// TODO: Notify user that deletion failed
			}
		});
	});

	socket.on('joinroom', function(roomName){

		if(socket.user === undefined)
			return;

		Couch.hasUserInRoom(roomName, socket.user.id, function(hasUser, users) {

			if(hasUser === false)
			{
				Couch.addUserToRoom(roomName, socket.user.id, function(newUsers) {

					Couch.getUsersFromKeys(newUsers, function(allUsers) {

						var roomUsers = allUsers.map(function(user) {

							return {
								profilePicture: user.profilePicture,
								profileUrl: user.profileUrl,
								firstName: user.firstName,
								lastInitial: user.lastName.charAt(0),
								location: user.location
							};
						});
						
						io.sockets.emit('updateroomusers', [{ name: roomName, users: roomUsers, userCount: roomUsers.length }]);

						Couch.getAllLocaleMessages(roomName, function(messages) {

							var roomMessages = messages.map(function(msg) {
								return {
									message: msg.message,
									firstName: msg.firstName,
									lastInitial: msg.lastInitial,
									profilePicture: msg.profilePicture,
									profileUrl: msg.profileUrl,
									timestamp: msg.timestamp
								};
							});

							socket.emit('loadroom', {"room": roomName, "messages": roomMessages, "users" : roomUsers, "userCount" : roomUsers.length});
						});
					});
				});

			}
			else
			{
				Couch.getUsersFromKeys(users, function(allUsers) {

					var roomUsers = allUsers.map(function(user) {

						return {
							profilePicture: user.profilePicture,
							profileUrl: user.profileUrl,
							firstName: user.firstName,
							lastInitial: user.lastName.charAt(0),
							location: user.location
						};
					});
					
					io.sockets.emit('updateroomusers', [{ name: roomName, users: roomUsers, userCount: roomUsers.length }]);

					Couch.getAllLocaleMessages(roomName, function(messages) {

						var roomMessages = messages.map(function(msg) {
							return {
								message: msg.message,
								firstName: msg.firstName,
								lastInitial: msg.lastInitial,
								profilePicture: msg.profilePicture,
								profileUrl: msg.profileUrl,
								timestamp: msg.timestamp
							};
						});

						socket.emit('loadroom', {"room": roomName, "messages": roomMessages, "users" : roomUsers, "userCount" : roomUsers.length});
					});
				});
			}

		});
	});

	socket.on('updateuser', function(userData) {

		if(socket.user === undefined)
			return;
		
		Couch.getUserById(socket.user.id, function(user) {

			user.profilePicture = userData.profilePicture;

			Couch.replaceUserById(socket.user.id, user);
		});			
	});

	// listen to users leaving rooms
	// TODO: Only emit updates to the users who are actually connected to the room who has
	// a person leaving the room. Currently it emits updaterooms to ALL sockets which is
	// a privacy, security, and performance concern
	socket.on('leaveroom', function(roomName){

		if(socket.user === undefined)
			return;

		Couch.getLocaleByName(roomName, function(locale) {

			var userKey = "user_" + socket.user.id.toString();

			var idx = locale.users.indexOf(userKey);

			if(idx > -1) {

				locale.users.splice(idx, 1);

				Couch.replaceLocaleByName(roomName, locale, function() {

					socket.leave(roomName);

					var updatedRoom = {
						name: roomName,
						users: locale.users
					}

					io.sockets.emit('updateroomusers', [updatedRoom]);
				});
			}
		});
	});
	
	socket.on('disconnect', function(){

		// Invalid sessions
		if(socket.user === undefined)
			return;

		if(socket.user.id === undefined)
			return;

		Couch.getRoomsByUser(socket.user.id, function(rooms) {

			var userKey = "user_" + socket.user.id.toString();

			var updatedRooms = [];

			for(var i in rooms) {
				Couch.getLocale(rooms[i], function(locale) {

					var idx = locale.users.indexOf(userKey);

					locale.users.splice(idx, 1);

					Couch.replaceLocaleByKey(rooms[i], locale, function(data) {

						updatedRooms.push( { room: data.name, users: data.users });

						// Emit the update once we have all the room data
						if(updatedRooms.length === rooms.length)
							io.sockets.emit('updateroomusers', updatedRooms);
					});
				});
			}
		});
	});

});