define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleAuth',
	'LocaleView'
], function($, _, Backbone, Bootstrap){

	var IsAuthed = false;

	var Initialize = function () {
	}

	var GetAuthState = function() {
		return IsAuthed;
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize,
		GetAuthState: GetAuthState
	};
});