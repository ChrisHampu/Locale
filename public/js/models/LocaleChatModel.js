define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone){
	
	/**
	  * @extends BackBone.Model
	  */
	var LocaleChatModel = Backbone.Model.extend({

		initialize: function() {

		},

		// Default values if they aren't provided during initialization of the object
		defaults: {
			location: undefined,
			name: "Room",
			radius: 1000,
			canJoin: false,
			userCount: 0,
			description: undefined,
			tags: undefined,
			admin: ""
		}
	});

	/**
	  * Returns the object containing our extended Model
	  * @return
	  */
	return LocaleChatModel;
});