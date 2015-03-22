function Couch(couchbase) {

	this.Couchbase = couchbase;
	this.Cluster = new this.Couchbase.Cluster('couchbase://127.0.0.1');
	this.Locale = this.Cluster.openBucket("locale");
};

Couch.prototype.addRoom = function(room, callback) {

};

Couch.prototype.deleteRoom = function(room, callback) {

};

Couch.prototype.getRoomByName = function(name, callback) {

};

Couch.prototype.getRooms = function (callback) {

};

Couch.prototype.getAllowedRoomNames = function (lat, lon, callback){

};

// Persist a message, passes the data object back into the callback
Couch.prototype.persistMessage = function (data, callback){

};

Couch.prototype.saveRoom = function(room, callback) {
	

};

Couch.prototype.addUserToRoom = function(name, user) {


};

Couch.prototype.getRoomsByUser = function(user, callback) {
	

};

Couch.prototype.removeUserFromRooms = function(user, rooms, callback) {


};

Couch.prototype.removeUserFromRoomSub = function(room, count, callback) {


};

Couch.prototype.removeAllUsersFromRoom = function(room) {


};

// Return the last 10 messages for a room
Couch.prototype.getRoomHistory = function (room, callback){

};

module.exports = Couch;
