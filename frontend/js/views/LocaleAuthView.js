define([
	'jquery',
	'thorax',
	'bootstrapjs',
	'LocaleAuth'
], function($, Thorax, Bootstrap, LocaleAuth){

	var Router;

	var LocaleAuthView = Thorax.View.extend({
		el: '#loginpage',

		events: {
			'click #facebook' : 'loginFB',
			'click #google-plus' : 'loginGoogle'
		},

		initialize: function(options) {
			Router = options.parent;

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

			var unsupported = [];
			var html = "";

			if(!features.SupportsGeolocation)
				unsupported.push("Geolocation");
			if(!features.SupportsWebsocket)
				unsupported.push("WebSockets");

			if(unsupported.length > 0)
			{
				div.css("display", "block");
			}

			div = div.find("#unsupportedFeaturesMessage")

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