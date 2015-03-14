/**
 * Schemas.js
 *
 * Defines schemas for our overall objects. USE THEM
 *
 */

schemas = {
	world: {
		rooms: null
	},

	user: {
		id: null,
        name: null,
        fbToken: null,
        location: null,
        privacy: null
	},

    room: {
        id: null,
        name: null,
        active: null,
        location: null,
        privacy: null
    }
}

module.exports = schemas;
