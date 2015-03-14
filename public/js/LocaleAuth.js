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
		CachedResponse,
		AppToken = 616102381854407,
		RedirectURL = "http://getlocale.me";

	var FBAuthStateChanged = function(response) {
		CachedResponse = response;

		if(response.status === 'connected')
		{
			console.log("connected to fb by cache");

			IsAuthed = true;

			// Navigate to actual site
			LocaleRouter.navigate("home", {trigger: true});
		}
		else if(response.status === 'not_authorized')
		{
			// Attempt to authenticate
			window.location.href = "https://www.facebook.com/dialog/oauth?client_id=" + AppToken + "&redirect_uri=" + RedirectURL;
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

	var LoginFacebook = function() {
		FB.login(function(response) {
			if(response.authResponse) {
				console.log("connected to fb by login");
				IsAuthed = true;
				LocaleRouter.navigate("home", {trigger: true});
			}
			else
			{
				console.log("User did not authenticate");
			}
		}, { scope: 'public_profile' });
	}

	var LoginGooglePlus = function() {

	}

	var LogoutFacebook = function() {
	   FB.logout(function(response) {
	        // Person is now logged out
	    });
	}

	var LogoutGooglePlus = function() {
		
	}

	var Logout = function() {
		LogoutFacebook();
		LogoutGooglePlus();
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize,
		GetAuthState: GetAuthState,
		GetAuthToken: GetAuthToken,
		LoginFacebook: LoginFacebook,
		LoginGooglePlus: LoginGooglePlus,
		Logout: Logout
	};
});