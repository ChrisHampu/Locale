define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleAuth',
	'LocaleView'
], function($, _, Backbone, Bootstrap, LocaleAuth, LocaleView){

	var Initialize = function () {
	
		LocaleAuth.Initialize();

		var Authed = LocaleAuth.GetAuthState();

		console.log("Locale authenticated is " + Authed);
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize
	};
});