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
		Router = AppRouter;

		var Features = LocaleUtilities.GetSupportedFeatures();

		if(Features.SupportsGeolocation)
			LocaleUtilities.Initialize();

		Router.getAuthView().notSupported(Features);
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize,
		RedirectLogin: RedirectLogin
	};
});