
var db = null;

//var db = require("./db.js");
var schemas = require("./schemas.js");
var _ = require("lodash");

var db2 = db;

var Room = function (data) {
    this.data = this.sanitize(data);
}

Room.prototype.data = {}

Room.prototype.changeName = function (name) {
    this.data.name = name;
}

Room.prototype.get = function (name) {
    return this.data[name];
}

Room.prototype.set = function (name, value) {
    this.data[name] = value;
}

Room.prototype.sanitize = function (data) {
    data = data || {};
    schema = schemas.Room;
    return _.pick(_.defaults(data, schema), _.keys(schema)); 
}

Room.prototype.save = function (callback) {
    var self = this;
    this.data = this.sanitize(this.data);
    // db.get('rooms', {id: this.data.id}).update(JSON.stringify(this.data)).run(function (err, result) {
    //     if (err) return callback(err);
    //     callback(null, result); 
    // });
}

Room.findById = function (id, callback) {
    // db.get('rooms', {id: id}).run(function (err, data) {
    //     if (err) return callback(err);
    //     callback(null, new Room(data));
    // });
	console.log('a');
}

module.exports = Room