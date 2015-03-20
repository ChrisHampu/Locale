/**
 * Creates an instance of World which can be used to acces
 * the application World
 *
 * @constructor
 * @param {db} Orchestrate DB instance
 */
 function World (db) {
    this.db = db;
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
		console.log(res.body.results[0].value);
		var room = res.body.results[0].value;
		
		console.log("Found: " + room.name);
	
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
	.query("value.users.firstName: \"" + user.firstName + "\"")
	.then(function(res) {
		console.log("callback");
		callback(res.body.results);
	})
	.fail( function(error) {
		console.log(error.body);
	});
}

World.prototype.removeUserFromRooms = function(user, rooms) {

	for(var i = 0; i < rooms.length; i++)
	{
		// A new list of users is made which acts as a list of who to keep
		var users = rooms[i].value.users;
		var newUsers = [];

		// Users that don't match the user we're deleting
		// are added to the "safe" list
		for(var j = 0; j < users.length; j++)
		{
			if(user.profileUrl !== users[j].profileUrl)
				newUsers.push(users[j]);
		}
				
		var usersRemoved = users.length - newUsers.length;
		this.db.newPatchBuilder("rooms", rooms[i].value.name).inc("userCount", -usersRemoved)
		.replace("users", newUsers)
		.apply()
		.then(function (res) {
		})
		.fail( function (error) {
			console.log(error.body);
		});			
	}
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
