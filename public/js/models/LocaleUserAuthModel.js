define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone){

	/**
	  * This model will hold a row of log message text
	  * @extends BackBone.Model
	  */
	var LocaleUserAuthModel = Backbone.Model.extend({

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
	return LocaleUserAuthModel;
});