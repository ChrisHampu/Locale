define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'socketio'
], function($, _, Backbone, Bootstrap, io){

	var Socket = undefined; 
	
	var Initialize = function() {
		Socket = io.connect('http://' + window.location.host + '/');
	};

	var Emit = function(handler, data) {

	};

	var AttachCallback = function(handler, callback) {
		Socket.on(handler, callback);
	};

	// Map public API functions to internal functions
	return {
		Initialize: Initialize,
		Emit: Emit,
		Handle: AttachCallback
	};
});