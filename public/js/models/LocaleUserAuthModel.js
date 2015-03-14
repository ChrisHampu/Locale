define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone){

	/**
	  * @extends BackBone.Model
	  */
	var LocaleUserAuthModel = Backbone.Model.extend({

		initialize: function() {

		},

		// Default values if they aren't provided during initialization of the object
		defaults: {
			id: undefined,
			location: undefined,
			firstName: "John",
			lastName: "Doe",
			token: undefined,
			email: ""
		}
	});

	/**
	  * Returns the object containing our extended Model
	  * @return
	  */
	return LocaleUserAuthModel;
});