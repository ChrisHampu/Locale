define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'Locale',
	'LocaleSocket',
	'LocaleAuthView',
	'LocaleView',
	'LocaleMapView'
], function($, _, Backbone, Bootstrap, Locale, LocaleSocket, LocaleAuthView, LocaleView){

	var AuthView,
		LocaleView;

	var LocaleRouter = Backbone.Router.extend({

		initialize: function() {

			LocaleSocket.Initialize();

			AuthView = new LocaleAuthView(this);
			LocaleView = new LocaleView();

			Locale.Initialize(this);
		},

		routes: {
			'': 'index',
			'login': 'login',
			'home': 'home',
			'logout': 'logout'
		},

		index: function() {
			
		},

		login: function() {
			AuthView.render();
		},

		home: function() {
			if(AuthView.isLoggedIn() === true)
				LocaleView.render();
			else
				this.navigate("login", { trigger: true });
		},

		logout: function() {
			AuthView.logout();
		},

		loggedin: function() {
			//AuthView.loggedin();
			this.navigate("home", { trigger: true });
		},

		default: function(action) {
			// show error popup?
			console.log("Undefined action: " + action);
		},

		getLocaleView: function() {
			return LocaleView;
		}
	});

	return LocaleRouter;
});