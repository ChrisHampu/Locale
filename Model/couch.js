var Geo = require('util.js');
var request = require("request");

function Couch(couchbase) {

	this.Couchbase = couchbase;
	this.Query = this.Couchbase.ViewQuery;
	this.Cluster = new this.Couchbase.Cluster('couchbase://127.0.0.1');
	this.Locale = this.Cluster.openBucket("locale");
};

Couch.prototype.persistUser = function(user, callback) {

	var key = "user_" + user.id.toString();

	user.type = "user";

	this.Locale.insert(key, user, function(err, result) {

		if(callback !== undefined)
			callback(key);
	});
};

Couch.prototype._getAllLocaleKeys = function(callback) {

	var query = this.Query.from("_design/dev_getlocales", "GetLocales");

	this.Locale.query(query, function(err, results) {

		callback(results.map( function(res) {
			return res.key;
		}));
	});
};

Couch.prototype.getAllLocales = function(callback) {

	this._getAllLocaleKeys( function(keys) {
		this.Locale.getMulti(keys, function(err, results) {
			callback(results);
		});
	});
};

// Returns an array containing the valid keys in a range of the user
Couch.prototype.getAllLocalesInRange = function(user, range, callback) {

	// Range is stored in meters, we need to pass kilometers
	var bbox = Geo.makeBoundingBox(user.location, range / 1000.0);

	request({ uri: "http://localhost:8092/locale/_desgin/dev_getlocales/_spatial/GetLocalesInRange?bbox="+bbox[0]+","+bbox[1]+","+bbox[2]+","+bbox[3],
				 method: "GET"}, function(error, response, body) {
		var res = JSON.parse(body);

		var locales = res.rows.map( function(keys) {
			return keys.value;
		});

		callback(locales);
	});
};

// Old API

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
