/**
 * Creates an instance of World which can be used to acces
 * the application World
 *
 * @constructor
 * @param {db} Orchestrate DB instance
 */
 function World (db) {
    this.db = db;
	
	this.getRooms( function(rooms) {

		rooms.map( function(room) {
		
			// Copypasta since I can't call this.removeAllusersFromRoom()
			
			// At startup, empty out all the users that may have persisted
			db.newPatchBuilder("rooms", room.name).replace("userCount", 0)
			.replace("users", [])
			.apply()
			.then(function (res) {
				console.log("Removed all users from " + room.name);
			})
			.fail( function (error) {
				console.log(error.body);
			});
			
			return room;
		});
	});
}

World.prototype.addRoom = function(room, callback) {
    this.db.put('rooms', room.name, room).then(callback());
}

World.prototype.deleteRoom = function(room, callback) {
    this.db.remove('rooms', room, true).then(function (result) {
        callback(result);
    });
}

World.prototype.getRoomByName = function(name, callback) {

	this.db.newSearchBuilder().collection("rooms").limit(1).query("value.name: " + name).then(function(res) {

		var room = res.body.results[0].value;
	
		callback(room);
	});
};

World.prototype.getRooms = function (callback) {
    this.db.list('rooms').then(function (result) {
        var roomObjects = result.body.results;

        var rooms = roomObjects.map(function(obj){ 
            return obj["value"];
        });

        callback(rooms);
    });

}

World.prototype.getAllowedRoomNames = function (lat, lon, callback){
    // Search for all rooms within 10km of the passed lat/long
    this.db.newSearchBuilder().collection("rooms").query("value.location:NEAR:{lat:" + lat + " lon:" + lon + " dist:1000m}").then(function (result) {
        var roomObjects = result.body.results;

        var rooms = roomObjects.map(function(obj){ 
            return obj["value"].name;
        });

        callback(rooms);
    })
}

// Persist a message, passes the data object back into the callback
World.prototype.persistMessage = function (data, callback){
    this.db.newEventBuilder()
        .from('rooms', data.room)
        .type('message')
        .data(data)
        .create()
        .then(function (result) {
            data["timestamp"] = result.path["timestamp"];
            callback(data);
        });
}

World.prototype.saveRoom = function(room, callback) {
	
	this.addRoom(room, function(updatedRoom) {
	
		callback(updatedRoom);
	});
}

World.prototype.addUserToRoom = function(name, user) {

	this.db.newPatchBuilder("rooms", name).inc("userCount", 1)
		.add("users.0", user)
		.apply()
		.then(function (res) {

		})
		.fail( function (error) {
			console.log(error.body);
		});
}

World.prototype.getRoomsByUser = function(user, callback) {
	
	this.db.newSearchBuilder()
	.collection("rooms")
	.limit(10)
	.query("value.users.id: \"" + user.id + "\"")
	.then(function(res) {
	
		var rooms = res.body.results.map(function(obj){ 
            return obj.value;
        });
		
		callback(rooms);
	})
	.fail( function(error) {
		console.log(error.body);
	});
}

World.prototype.removeUserFromRooms = function(user, rooms, callback) {

	for(var i = 0; i < rooms.length; i++)
	{
		// A new list of users is made which acts as a list of who to keep
		var users = rooms[i].users;
		var newUsers = [];

		// Users that don't match the user we're deleting
		// are added to the "safe" list
		for(var j = 0; j < users.length; j++)
		{
			if(user.id !== users[j].id)
				newUsers.push(users[j]);
		}
		
		rooms[i].users = newUsers;
		rooms[i].userCount = newUsers.length;
				
		var usersRemoved = users.length - newUsers.length;
		
		this.removeUserFromRoomSub(rooms[i], usersRemoved, function(newRooms) {
			callback(newRooms);
		});
	}
}

World.prototype.removeUserFromRoomSub = function(room, count, callback) {

	this.db.newPatchBuilder("rooms", room.name).inc("userCount", -count)
	.replace("users", room.users)
	.apply()
	.then(function (res) {
		callback([ { name : room.name, users: room.users, userCount: room.userCount }]);
	})
	.fail( function (error) {
		console.log(error.body);
	});
}

World.prototype.removeAllUsersFromRoom = function(room) {

	this.db.newPatchBuilder("rooms", room.name).replace("userCount", 0)
	.replace("users", [])
	.apply()
	.then(function (res) {
		console.log("Removed all users from " + room.name);
	})
	.fail( function (error) {
		console.log(error.body);
	});
}

// Return the last 10 messages for a room
World.prototype.getRoomHistory = function (room, callback){

    this.db.newEventReader()
        .from('rooms', room)
        .type('message')
        .list()
        .then(function (res) {
            var messages = res.body.results.map(function(object) {
                
                message = object.value;
                message.timestamp = object.timestamp;

                return message;
            });

            callback(messages)
        });
}

module.exports = World;
