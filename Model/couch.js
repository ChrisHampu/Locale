var makeBoundingBox = require('./util.js');
var request = require("request");

function Couch(couchbase) {

	this.Couchbase = couchbase;
	this.Query = this.Couchbase.ViewQuery;
	this.Cluster = new this.Couchbase.Cluster('couchbase://getlocale.me');
	this.Locale = this.Cluster.openBucket("locale");
	this.Locale.operationTimeout = 60 * 1000;
};

Couch.prototype.persistChatMessage = function(localeName, userId, message, callback) {

	var self = this;

	this.Locale.counter("locale_message_counter", 1, { initial: 0 }, function(err, res) {
		var key = "message_" + res.value.toString();
		var locale = "locale_" + localeName;

		self.Locale.insert(key, { locale: "locale_" + localeName, user: "user_" + userId, 
									message: message.message, type: "message", timestamp: Math.floor(new Date()),
									firstName: message.firstName, lastInitial: message.lastInitial,
									profilePicture: message.profilePicture },
									function(err, result) {

			self.Locale.get(locale, function(err, result) {

				if(err)
					throw err;

				result.value.messages.push(key);

				self.Locale.replace(locale, result.value, function(err, result) {

					callback();

				});
			});
		});
	});
};

Couch.prototype.persistLocale = function(locale, callback) {

	var key = "locale_" + locale.name;

	this.Locale.insert(key, locale, function(err, result) {

		if(err) {
			if(callback !== undefined)
				callback(true);
		}
		else {
			if(callback !== undefined)
				callback(false);			
		}
	});
};

Couch.prototype.persistUser = function(user, callback) {

	var key = "user_" + user.id;

	user.type = "user";

	this.Locale.insert(key, user, function(err, result) {

		if(err) {
			// Error code 12 means key already exists, which is fine
			if(err.code !== 12)
				throw err;
		}

		if(callback !== undefined)
			callback(key);
	});
};

Couch.prototype._getAllLocaleKeys = function(callback) {

	var query = this.Query.from("dev_getlocales", "GetLocales").stale(1);

	this.Locale.query(query, function(err, results) {

		if(err)
			throw err;

		callback(results.map( function(res) {
			return res.key;
		}));
	});
};

Couch.prototype.getAllLocales = function(callback) {

	var self = this;

	this._getAllLocaleKeys( function(keys) {
		self.Locale.getMulti(keys, function(err, results) {

			if(err) {
				console.log("error");
				console.log(err);
				throw err;
			}

			var locales = [];

			for(var i in results)
				locales.push(results[i].value);

			callback(locales);
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

		if(err)
			throw err;

		callback(res.value);
	});
};

// Returns an array containing the valid keys in a range of the user
Couch.prototype.getAllLocalesInRange = function(user, range, callback) {

	// Range is stored in meters, we need to pass kilometers
	var bbox = makeBoundingBox(user.location, range / 1000.0);

	var reqUri = "http://getlocale.me:8092/locale/_design/dev_getlocales/_spatial/GetLocalesInRange?stale=false&bbox="+bbox[0]+","+bbox[1]+","+bbox[2]+","+bbox[3];

	request({ uri: reqUri,
				 method: "GET"}, function(error, response, body) {

		var res = JSON.parse(body);

		console.log("in range");
		console.log(res);

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

		if(err)
			throw err;

		});
	});
};

Couch.prototype.replaceLocaleByName = function(localeName, localeData, callback) {

	var key = "locale_" + localeName;

	this.Locale.replace(key, localeData, function(err, res) {

		if(err)
			throw err;

		callback(localeData);
	});
};

Couch.prototype.replaceLocaleByKey = function(key, localeData, callback) {

	this.Locale.replace(key, localeData, function(err, res) {

		if(err)
			throw err;

		callback(localeData);
	});
};

// Returns the message keys from a locale
Couch.prototype._getAllLocaleMessages = function(locale, callback) {
	
	this.Locale.get(locale, function(err, res) {

		if(err)
			throw err;

		callback(res.value.messages);
	});
};

// Takes an array of message keys and returns the corresponding messages
Couch.prototype.getAllLocaleMessages = function(localeName, callback) {

	var localeKey = "locale_" + localeName;

	var self = this;

	this._getAllLocaleMessages(localeKey, function(messageKeys) {

		if(messageKeys === undefined || messageKeys.length === 0)
			callback([])
		else
		{
			self.Locale.getMulti(messageKeys, function(err, results) {

				if(err)
					throw err;

				var messages = [];

				for(var i in results)
					messages.push(results[i].value);

				callback(messages);
			});
		}
	});
};

Couch.prototype.deleteLocaleMessages = function(locale, callback) {

	this._getAllLocaleMessages(locale, function(keys) {
		for(var i in keys) {
			this.Locale.remove(i, function(err, res) {

				if(err)
					throw err;
			});
		}

		callback();
	});
};

Couch.prototype.hasUserInRoom = function(localeName, userId, callback) {

	var keyLocale = "locale_" + localeName;
	var keyUser = "user_" + userId;

	this.Locale.get(keyLocale, function(err, res) {

		if(err)
			throw err;

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

	var self = this;

	this.Locale.get(keyLocale, function(err, result) {

		if(err)
			throw err;

		var users = result.value.users;
		users.push(keyUser);

		result.value.users = users;

		self.Locale.replace(keyLocale, result.value, function(err, result) {

			// Send updated list of user keys
			callback(users);
		});
	});
};

Couch.prototype.getUsersFromKeys = function(userKeys, callback) {

	this.Locale.getMulti(userKeys, function(err, results) {

		var users = [];

		for(var i in results)
			users.push(results[i].value);

		callback(users);
	});
};

Couch.prototype.getRoomsByUser = function(userId, callback) {

	var query = this.Query.from("dev_getlocales", "GetLocalesByUser").key("user_" + userId).stale(1);

	this.Locale.query(query, function(err, results) {

		if(err)
			throw err;

		callback(results.map( function(res) {
			return res.value;
		}));
	});

};

module.exports = Couch;
