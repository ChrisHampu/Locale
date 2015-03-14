define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleAuth',
	'LocaleView',
	'LocaleAuthView'
], function($, _, Backbone, Bootstrap, LocaleAuth, LocaleView, LocaleAuthView){

	var Router;

	var OnLoggedIn = function() {
		Router.loggedin();
	}

	var Initialize = function (AppRouter) {
	
		Router = AppRouter;

		LocaleAuth.Initialize(this);

		var Authed = LocaleAuth.GetAuthState();

		console.log("Locale authenticated is " + Authed);
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize,
		OnLoggedIn: OnLoggedIn
	};
});