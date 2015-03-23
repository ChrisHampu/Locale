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
		var locale = "locale_" + localeName;

		this.Locale.insert(key, { locale: "locale_" + localeName, user: "user_" + userId.toString(), 
									message: message.message, type: "message", timestamp: Math.floor(new Date()),
									firstName: message.firstName, lastInitial: message.lastInitial,
									profilePicture: message.profilePicture },
									function(err, result) {

			this.Locale.get(locale, function(err, result) {

				result.value.messages.push(key);

				this.Locale.replace(locale, result.value, function(err, result) {

					callback();

				});
			});
		});
	});
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

Couch.prototype.getLocale = function(locale, callback) {

	this.Locale.get(locale, function(err, res) {
		callback(res.value);
	});
}

Couch.prototype.getLocaleByName = function(localeName, callback) {

	var localeKey = "locale_" + localeName;

	this.Locale.get(localeKey, function(err, res) {
		callback(res.value);
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


	this.deleteLocaleMessages(key, function() {
		this.Locale.remove(key, function(err, res) {

		});
	});
};

Couch.prototype.replaceLocaleByName = function(localeName, localeData, callback) {

	var key = "locale_" + localeName;

	this.Locale.replace(key, localeData, function(err, res) {

		callback(localeData);
	});
};


// Returns the message keys from a locale
Couch.prototype._getAllLocaleMessages = function(locale, callback) {
	
	this.Locale.get(locale, function(err, res) {
		callback(res.messages);
	});
};

// Takes an array of message keys and returns the corresponding messages
Couch.prototype.getAllLocaleMessages = function(localeName, callback) {

	var localeKey = "locale_" + localeName;

	this._getAllLocaleMessages(localeKey, function(messageKeys) {

		this.Locale.getMulti(messageKeys, function(err, results) {

			callback(results.value);
		});
	});
};

Couch.prototype.deleteLocaleMessages = function(locale, callback) {

	this._getAllLocaleMessages(locale, function(keys) {
		for(var i in keys) {
			this.Locale.remove(i, function(err, res) {
			});
		}

		callback();
	});
};

Couch.prototype.hasUserInRoom = function(localeName, userId, callback) {

	var keyLocale = "locale_" + localeName;
	var keyUser = "user_" + userId;

	this.Locale.get(keyLocale, function(error, res) {

		if(res.value.users.indexOf(keyUser) !== -1) {
			callback(true, res.value.users);
		} else {
			callback(false, res.value.users);
		}
	});
};

// Will replace the users in the specified locale with the new array of users
Couch.prototype.addUserToRoom = function(localeName, userId , callback) {

	var keyLocale = "locale_" + localeName;
	var keyUser = "user_" + userId;

	this.Locale.get(keyLocale, function(err, result) {

		result.value.push(keyUser);

		this.Locale.replace(keyLocale, result.value, function(err, result) {

			// Send updated list of user keys
			callback(res.value.users);
		});
	});
};

Couch.prototype.getUsersFromKeys = function(userKeys, callback) {

	this.Locale.getMulti(userKeys, function(err, result) {
		callback(result.value);
	});
};

Couch.prototype.getRoomsByUser = function(userId, callback) {

	var query = this.Query.from("_design/dev_getlocales", "GetLocalesByUser").key("user_" + userId.toString());

	this.Locale.query(query, function(err, results) {

		callback(results.map( function(res) {
			return res.value;
		}));
	});

};

module.exports = Couch;
