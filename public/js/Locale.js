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

	var RedirectLogin = function() {
		Router.navigate("", { trigger: true} );
	}

	var Initialize = function (AppRouter) {
		LocaleUtilities.Initialize();

		Router = AppRouter;

		//LocaleAuth.Initialize(this);
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize,
		RedirectLogin: RedirectLogin
	};
});