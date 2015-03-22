var Geo = require('util.js');
var request = require("request");

function Couch(couchbase) {

	this.Couchbase = couchbase;
	this.Query = this.Couchbase.ViewQuery;
	this.Cluster = new this.Couchbase.Cluster('couchbase://127.0.0.1');
	this.Locale = this.Cluster.openBucket("locale");
};

Couch.prototype.persistChatMessage = function(localeName, userId, message, callback) {

	this.Locale.counter("locale_message_counter", 1, function(err, res) {
		var key = "message_" + res.value.toString();

		this.Locale.insert(key, { locale: "locale_" + localeName, user: "user_" + userId.toString(), 
									message: message.message, type: "message", timestamp: Math.floor(new Date()),
									firstName: message.firstName, lastInitial: message.lastInitial,
									profilePicture: message.profilePicture },
									function(err, result) {

			callback();
		})
	})
};

Couch.prototype.persistLocale = function(locale, callback) {

	var key = "locale_" + locale.name;

	this.Locale.insert(key, locale, function(err, result) {

		if(callback !== undefined)
			callback(key);
	});
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

Couch.prototype.deleteLocale = function(locale) {

	var key = "locale_" + locale;

	this.Locale.remove(key, function(err, result) {
		this.deleteLocaleMessages(key);
	});
};

Couch.prototype._getAllLocaleMessages = function(callback) {
	var query = this.Query.from("_design/dev_getlocales", "GetLocaleMessages");

	this.Locale.query(query, function(err, results) {

		callback(results.map( function(res) {
			return { key: res.key, locale: res.value };
		}));
	});
}

Couch.prototype.deleteLocaleMessages = function(locale) {

	this._getAllLocaleMessages(function(messages) {
		for(var i = 0; i < messages.length; i++)
		{
			if(messages[i].locale === locale)
			{
				this.Locale.remove(messages[i].key, function(err, result) {

				};
			}
		}
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
