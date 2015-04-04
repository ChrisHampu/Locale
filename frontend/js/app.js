define([
	'jquery',
	'backbone',
	'bootstrapjs',
	'LocaleRouter'
], function($, Backbone, Bootstrap, LocaleRouter){

	var Router;

	var Initialize = function () {
		Router = new LocaleRouter();

		Backbone.history.start();
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize
	};
});