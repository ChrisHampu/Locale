define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone){
	
	/**
	  * @extends BackBone.Model
	  */
	var LocaleChatMessageModel = Backbone.Model.extend({

		initialize: function() {

		},

		// Default values if they aren't provided during initialization of the object
		defaults: {
			firstName: "John",
			timestamp: undefined,
			room: undefined,
			message: undefined,
			lastInitial: "D",
			profileUrl: "",
			profilePicture: ""
		}
	});

	/**
	  * Returns the object containing our extended Model
	  * @return
	  */
	return LocaleChatMessageModel;
});