define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleAuth'
], function($, _, Backbone, Bootstrap, LocaleAuth){

	var Router;

	var LocaleAuthView = Backbone.View.extend({
		el: '#loginpage',

		events: {
			'click #facebook' : 'loginFB',
			'click #google-plus' : 'loginGoogle'
		},

		initialize: function(router) {
			Router = router;

			LocaleAuth.Initialize(this);
		},

		render: function() {
			this.$el.css("z-index", 5);
		},

		loginFB: function() {
			LocaleAuth.LoginFacebook();
		},

		loginGoogle: function() {
			LocaleAuth.LoginGooglePlus();
		},

		logout: function() {
			LocaleAuth.Logout();
		},

		loggedin: function() {
			this.$el.css("z-index", -5);
			Router.loggedin();
		},

		redirectToLogin: function() {
			Router.navigate("login", { trigger: true });
		},

		isLoggedIn: function() {
			return LocaleAuth.GetAuthState();
		},

		notSupported: function(features) {
			var div = this.$el.find("#unsupportedFeatures");
			div.css("display", "block");

			div = div.find("#unsupportedFeaturesMessage")

			var unsupported = [];
			var html = "";

			if(!features.SupportsGeolocation)
				unsupported.push("Geolocation");
			if(!features.SupportsWebsocket)
				unsupported.push("WebSockets");

			for(var i = 0; i < unsupported.length; i++) {
				if(i != 0)
					html += ', ';
				html += unsupported[i];
			}

			div.html(html);
		}
	});

	return LocaleAuthView;
});