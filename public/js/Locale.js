define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleUtilities',
	'LocaleAuth',
	'LocaleView',
	'LocaleAuthView',
	'LocaleSocket'
], function($, _, Backbone, Bootstrap, LocaleUtilities, LocaleAuth, LocaleView, LocaleAuthView, LocaleSocket){

	var Router;

	var OnLoggedIn = function() {
		Router.loggedin();
	}

	var RedirectLogin = function() {
		Router.navigate("", { trigger: true} );
	}

	var Initialize = function (AppRouter) {
	
		LocaleSocket.Initialize();
		LocaleSocket.Handle('connect', function () {
			console.log("connected to websocket");
		});

		LocaleUtilities.Initialize();

		Router = AppRouter;

		LocaleAuth.Initialize(this);

		var Authed = LocaleAuth.GetAuthState();

		console.log("Locale authenticated is " + Authed);
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize,
		OnLoggedIn: OnLoggedIn,
		RedirectLogin: RedirectLogin
	};
});