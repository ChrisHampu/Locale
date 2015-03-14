define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'Locale'
], function($, _, Backbone, Bootstrap, Locale){

	var Initialize = function () {
	
		console.log("All systems go");

		Locale.Initialize();
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize
	};
});