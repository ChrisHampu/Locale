define([
	'jquery',
	'socketio'
], function($, io){

	var Socket = undefined,
		Connected; 
	
	var Initialize = function() {
		Socket = io.connect('http://' + window.location.host + '/');

		AttachCallback('connect', function () {
			console.log("connected to websocket");
			Connected = true;
		});
	};

	var Emit = function(handler, data) {
		if(Connected === false)
			return;

		Socket.emit(handler, data);
	};

	var AttachCallback = function(handler, callback) {
		Socket.on(handler, callback);
	};

	var IsConnected = function() {
		return Connected;
	}

	// Map public API functions to internal functions
	return {
		Initialize: Initialize,
		Emit: Emit,
		Handle: AttachCallback,
		IsConnected: IsConnected
	};
});