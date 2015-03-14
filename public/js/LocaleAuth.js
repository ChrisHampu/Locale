define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleRouter',
	'facebook'
], function($, _, Backbone, Bootstrap, LocaleRouter){

	var IsAuthed = false,
		AuthToken,
		CachedResponse;

	var FBAuthStateChanged = function(response) {
		CachedResponse = response;

		if(response.status === 'connected')
		{
			console.log("connected to fb");

			IsAuthed = true;

			// Navigate to actual site
			LocaleRouter.navigate("home", {trigger: true});
		}
	}

	var GPlusAuthStateChanged = function() {

	}

	var Initialize = function () {
		FB.init( {
			appId      : '616102381854407',
      		xfbml      : true,
      		version    : 'v2.2'
      	});

      	FB.getLoginStatus(function(response) {
      		FBAuthStateChanged(response);
      	})
	}

	var GetAuthState = function() {
		return IsAuthed;
	}

	var GetAuthToken = function() {
		return AuthToken;
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize,
		GetAuthState: GetAuthState,
		GetAuthToken: GetAuthToken
	};
});