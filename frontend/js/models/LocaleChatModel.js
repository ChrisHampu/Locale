define([
	'thorax'
], function(){
	
	/**
	  * @extends Thorax.Model
	  */
	var LocaleChatModel = Thorax.Model.extend({

		initialize: function() {

		},

		// Default values if they aren't provided during initialization of the object
		defaults: {
			location: undefined,
			name: "Room",
			radius: 1000,
			canJoin: false,
			userCount: 0,
			users: [],
			description: undefined,
			tags: [],
			admin: ""
		}
	});

	/**
	  * Returns the object containing our extended Model
	  * @return
	  */
	return LocaleChatModel;
});