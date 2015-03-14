define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'Locale',
	'LocaleAuthView',
	'LocaleView',
	'LocaleMapView'
], function($, _, Backbone, Bootstrap, Locale, LocaleAuthView, LocaleView, LocaleMapView){

	var AuthView,
		MapView;

	var LocaleRouter = Backbone.Router.extend({

		initialize: function() {

			AuthView = new LocaleAuthView();
			MapView = new LocaleMapView();

			Locale.Initialize(this);
		},

		routes: {
			'': 'index', // Auth page
			'home': 'home',
			'logout': 'logout'
		},

		index: function() {
			
		},

		home: function() {
			LocaleView.render();
		},

		logout: function() {
			AuthView.logout();
		},

		loggedin: function() {
			AuthView.loggedin();
		},

		default: function(action) {
			// show error popup?
			console.log("Undefined action: " + action);
		}
	});

	return LocaleRouter;
});