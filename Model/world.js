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
    this.db.put('rooms', room.name, room)
}

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
