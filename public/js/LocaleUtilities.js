define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs'
], function($, _, Backbone, Bootstrap){

	var CurrentLocation = undefined;
	
	var Initialize = function() {
		navigator.geolocation.getCurrentPosition(function(position) 
		{
			CurrentLocation = position;
		}, function() {
	      handleNoGeolocation(true);
	    });
	}

	var GetCurrentLocation = function(callback) {

		if(callback !== undefined)
		{
			if(CurrentLocation !== undefined)
			{
				callback(CurrentLocation);
			}
			else
			{
				if(navigator.geolocation)
				{
					navigator.geolocation.getCurrentPosition(function(position) 
					{
						CurrentLocation = position;
						callback(CurrentLocation);
					}, function() {
				      handleNoGeolocation(true);
				    });
				}
				else
				{
					console.log("Failed to get browser location");
					return undefined;
				}	
			}

		}
		else
			return CurrentLocation;
	}

	// Map public API functions to internal functions
	return {
		Initialize: Initialize,
		GetCurrentLocation: GetCurrentLocation
	};
});