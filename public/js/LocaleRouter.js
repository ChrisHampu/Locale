define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'Locale',
	'LocaleAuthView'
], function($, _, Backbone, Bootstrap, Locale, LocaleAuthView){

	var AuthView;

	var LocaleRouter = Backbone.Router.extend({

		initialize: function() {

			AuthView = new LocaleAuthView();

			Locale.Initialize();
		},

		routes: {
			'': 'index', // Auth page
			'home': 'home',
			'logout': 'logout'
		},

		index: function() {
			
		},

		home: function() {

		},

		logout: function() {
			AuthView.logout();
		},

		default: function(action) {
			// show error popup?
			console.log("Undefined action: " + action);
		}
	});

	return LocaleRouter;
});