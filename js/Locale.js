define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs'
], function($, _, Backbone, Bootstrap){

	var Initialize = function () {
	
		console.log("Running locale");
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize
	};
});