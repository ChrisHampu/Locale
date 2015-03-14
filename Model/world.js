var schemas = require("./schemas.js");
var _ = require("lodash");
var Room = require("./room.js")


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

World.prototype.getRooms = function (callback) {

    var rooms = null;

    this.db.list('rooms').then(function (result) {
        var roomObjects = result.body.results;

        var rooms = roomObjects.map(function(obj){ 
            return obj["value"];
        });

        callback(rooms);
    });

}

World.prototype.addRoom = function(room, callback) {

    this.db.put('rooms', room.name, room)

}


World.prototype.getValidRooms = function (lat, long, callback){



}


module.exports = World;
