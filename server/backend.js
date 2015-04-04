var express = require('express')
, app = express()
, http = require('http')
, server = http.createServer(app)
, io = require('socket.io').listen(server)
, couchbase = require('couchbase')
, geolib = require('geolib')
, path = require('path')
, sassMiddleware = require('node-sass-middleware');

// 
// DEVELOPMENT SWITCH
//
var InDev = true;
var FrontendPath = __dirname + "/../frontend";
var StaticPath = __dirname + "/../static";

// developmentMode is true for dev, and false for production
var Initialize = function(developmentMode) {

	if(developmentMode === true) {
		console.log("Running in development mode");
	} else {
		console.log("Running in production mode");
		FrontendPath = __dirname + "/../deploy";
	}
	
	// 
	// SERVER CONFIG
	//
	server.listen(80, function(){
		var host = server.address().address;
		var port = server.address().port;

		console.log('Locale webserver launched at http://%s:%s', host, port);
	});

	// For sass files during development for realtime compiling
	if(developmentMode === true)
		app.use(sassMiddleware({src: path.resolve(__dirname + '/../frontend'),
								dest: path.resolve(__dirname + '/../frontend'),
								debug: true,
								outputStyle: 'expanded'}));

	// For static files
	app.use(express.static(path.resolve(StaticPath)));

	// For dynamic js/css
	app.use(express.static(path.resolve(FrontendPath)));

	// 
	// ROUTING
	//
	app.get('', function (req, res) {
		// Index
		res.sendFile(path.resolve(FrontendPath + '/locale.html'));
	});

	app.get('/ourstack', function (req, res) {
		res.sendFile(path.resolve(__dirname + '/../static/ourStack.html'));
	});
}

// Export to external scripts (ie: grunt)
module.exports = Initialize;

if(module.parent) {
	// Wait to be initialized by external script
}
else
{
	// Live server will be passed this by command line to signal we're in production
	process.argv.forEach(function(val, index, array) {
		if(val === "production") {
			InDev = false;
		}
	});
	
	Initialize(InDev);
}

//
// "SUPERGLOBALS"
//

var CouchDB = require("./Model/couch.js");
var Couch = new CouchDB(couchbase, InDev);

//
// SOCKET IO
//

io.sockets.on('connection', function (socket) {

	// When the client emits 'join', this listens and executes
	socket.on('join', function(user){
		var newUser = JSON.parse(user);

		// TODO: Verify auth token being given before even treating user as valid

		// Store the username in the socket session for this client
		socket.username = newUser.firstName;
		socket.user = newUser;

		// Persist the user in the database, and return the key for the user data
		Couch.persistUser(newUser, function(userKey) {

			Couch.getAllLocales( function(locales) {

				Couch.getAllLocalesInRange(newUser, 1000.0, function(localesInRange) {

					var updatedLocales = [];

					for(var i = 0; i < locales.length; i++) {

						var locale = locales[i];

						if(locale.privacy !== "public" && locale.owner !== userKey) {
							continue;
						}

						var join = !(localesInRange.indexOf(locale.name) === -1);

						var isClose = geolib.getDistance(newUser.location, locale.location) < locale.radius;

						// Put together the data that we want clients to receive
						updatedLocales.push({
							name: locale.name,
							description: locale.description,
							location: locale.location,
							radius: locale.radius,
							tags: locale.tags,
							canJoin: join && isClose,
							privacy: locale.privacy
						});					
					}

					socket.emit('updaterooms', updatedLocales);
				});
			});
		});
	});

	// listener, add rooms to the database by user request
	socket.on('addroom', function (data) {

		if(socket.user === undefined)
			return;

		if(data.name === undefined)
			return;

		if(data.name.length === 0)
			return;

		// Sanity check the privacy mode just in case
		if(data.privacy === undefined)
			data.privacy = "public";
		else if(data.privacy !== "public" && data.privacy !== "private" && data.privacy !== "unlisted")
			data.privacy = "public";

		var newLocale = {
			name: data.name,
			description: data.description,
			location: socket.user.location,
			radius: data.range, // TODO: Cap value
			owner: "user_" + socket.user.id.toString(),
			tags: data.tags,
			users: [],
			messages: [],
			type: "locale",
			creationDate: Math.floor(new Date()),
			privacy: data.privacy
		};

		Couch.persistLocale(newLocale, function(exists) {

			if(exists === false)
			{
				for(var i in io.sockets.connected) {

					var curSocket = io.sockets.connected[i];

					if(curSocket.user === undefined)
						continue;

					var userKey = "user_" + curSocket.user.id;

					Couch.getAllLocales( function(locales) {

						Couch.getAllLocalesInRange(curSocket.user, 1000, function(localesInRange) {

							var updatedLocales = [];

							for(var i = 0; i < locales.length; i++) {

								var locale = locales[i];

								if(locale.privacy !== "public" && locale.owner !== userKey) {
									continue;
								}

								var join = !(localesInRange.indexOf(locale.name) === -1);

								var isClose = geolib.getDistance(curSocket.user.location, locale.location) < locale.radius;

								// Put together the data that we want clients to receive
								updatedLocales.push({
									name: locale.name,
									description: locale.description,
									location: locale.location,
									radius: locale.radius,
									tags: locale.tags,
									canJoin: join && isClose,
									privacy: locale.privacy
								});					
							}

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

	// A user can update the settings of a room
	socket.on('updateroom', function (data) {

		if(socket.user === undefined)
			return;

		if(data.updateRoom === undefined)
			return;

		Couch.getLocaleByName(data.updateRoom, function(locale) {

			if(locale === undefined) {
				console.log("updateroom: Invalid locale being referenced");
				return;
			}

			var userKey = "user_" + socket.user.id;

			if(locale.owner === userKey) {

				Couch.getLocaleByName(data.name, function(existingLocale) {
					locale.name = data.name;
					locale.description = data.description;
					locale.privacy = data.privacy;
					locale.tags = data.tags;

					if(existingLocale !== undefined)
					{
						Couch.replaceLocaleByName(data.updateRoom, locale, function() {

							locale.updateRoom = data.updateRoom;

							socket.emit('updaterooms', [locale]);
						});
					}	
					else
					{
						Couch.moveMessagesToNewLocaleHard(locale.messages, "locale_" + data.name)

						Couch.replaceLocaleAttributes(data.updateRoom, locale, function() {

							locale.updateRoom = data.updateRoom;

							socket.emit('updaterooms', [locale]);
						});
					}
				});

			} else {
				// TODO: Notify user that update failed
			}
		});

	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {;

		if(socket.user === undefined)
			return;

		var message = {
			"locale": "locale_" + data.room,
			"firstName": socket.user.firstName,
			"lastInitial": socket.user.lastName.charAt(0),
			"profilePicture": socket.user.profilePicture,
			"profileUrl": socket.user.profileUrl,
			"message": data.message.slice(0,200),
			"timestamp": Math.floor(new Date())
		};

		// TODO: Is the user even allowed to send a chat to this room? Check for spoofed messages

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

			// TODO: Get room and check radius/privacy to ensure user is allowed to join this room

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
			socket.user.profilePicture = userData.profilePicture;

			Couch.replaceUserById(socket.user.id, user);
		});			
	});

	// listen to users leaving rooms
	// TODO: Only emit updates to the users who are actually connected to the room who has
	// a person leaving the room. Currently it emits updaterooms to ALL sockets which is
	// a privacy, security, and performance concern
	// TODO: Emit only to users within the bounding box of the room
	// TODO: Emit only to users who are permitted by room privacy settings
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
	
	// TODO: Same as leave event list
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