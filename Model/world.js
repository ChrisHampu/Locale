var schemas = require("./schemas.js");
var _ = require("lodash");
var Room = require("./room.js")

/**
 * Creates an instance of World which can be used to access
 * the application World
 *
 * @constructor
 * @param {db} Orchestrate DB instance
 */
function World (db) {
  if (!(this instanceof World)) {
    return new World(db)
  }

  /**
   * Orchestrate DB used for datastore
   * @type {db}
   * @protected
   */
  this._db = db
}


World.prototype.data = {}

World.prototype.get = function (name) {
    return this.data[name];
}

World.prototype.set = function (name, value) {
    this.data[name] = value;
}

World.prototype.sanitize = function (data) {
    data = data || {};
    schema = schemas.World;
    return _.pick(_.defaults(data, schema), _.keys(schema)); 
}

World.prototype.getRooms = function (callback) {

    console.log(this._db);

    // These will come from the DB, hardcoded for dev
    var room1 = new Room();
    var room2 = new Room();
    var room3 = new Room();

    room1.set('name', 'Room1');
    room2.set('name', 'Room2');
    room3.set('name', 'Room3');

    callback(null, [room1, room2, room3]);
}

module.exports = World