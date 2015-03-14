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

			//AuthView = new LocaleAuthView();

			Locale.Initialize();
		},

		routes: {
			'': 'index', // Auth page
			'home': 'home'
		},

		index: function() {
			
		},

		home: function() {

		},

		default: function(action) {
			// show error popup?
			console.log("Undefined action: " + action);
		}
	});

	return LocaleRouter;
});