define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'Locale'
], function($, _, Backbone, Bootstrap, Locale){

	var LocaleRouter = Backbone.Router.extend({

		initialize: function() {
			Locale.Initialize();
		},

		routes: {
			'': 'index'
		},

		index: function() {
			
		},

		default: function(action) {
			// show error popup?
			console.log("Undefined action: " + action);
		}
	});

	return LocaleRouter;
});