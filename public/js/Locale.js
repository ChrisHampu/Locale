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
		LocaleUtilities.Initialize();

		Router = AppRouter;

		LocaleAuth.Initialize(this);

		var Authed = LocaleAuth.GetAuthState();

		console.log("Locale authenticated is " + Authed);
	}

	var SetProfilePic = function(url) {
		Router.getLocaleView().getMapView().getProfileView().setProfilePic(url);
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize,
		OnLoggedIn: OnLoggedIn,
		RedirectLogin: RedirectLogin,
		SetProfilePic: SetProfilePic
	};
});