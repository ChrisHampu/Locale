define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone){

	/**
	  * @extends BackBone.Model
	  */
	var LocaleChatUserModel = Backbone.Model.extend({

		initialize: function() {

		},

		// Default values if they aren't provided during initialization of the object
		defaults: {

		}
	});

	/**
	  * Returns the object containing our extended Model
	  * @return
	  */
	return LocaleChatUserModel;
});