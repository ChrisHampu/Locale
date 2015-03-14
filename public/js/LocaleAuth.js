define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'facebook'
], function($, _, Backbone, Bootstrap){

	var IsAuthed = false,
		AuthToken,
		CachedResponse,
		AppToken = 616102381854407,
		RedirectURL = "http://getlocale.me",
		Locale;

	var FBAuthStateChanged = function(response) {
		CachedResponse = response;

		if(response.status === 'connected')
		{
			AuthToken = response.authResponse.accessToken;

			console.log("connected to fb by cache");

			IsAuthed = true;

			// Navigate to actual site
			Locale.OnLoggedIn();
		}
		else if(response.status === 'not_authorized')
		{
			// Attempt to authenticate
			window.location.href = "https://www.facebook.com/dialog/oauth?client_id=" + AppToken + "&redirect_uri=" + RedirectURL;
		}
	}

	var GPlusAuthStateChanged = function() {

	}

	var Initialize = function (LocaleApp) {
		FB.init( {
			appId      : '616102381854407',
      		xfbml      : true,
      		version    : 'v2.2'
      	});

      	FB.getLoginStatus(function(response) {
      		FBAuthStateChanged(response);
      	});

      	Locale = LocaleApp;
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
				AuthToken = response.authResponse.accessToken;
				IsAuthed = true;
				Locale.OnLoggedIn();
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
		if(IsAuthed === true)
			window.location.href = "https://api.facebook.com/restserver.php?method=auth.expireSession&format=json&access_token=" + AuthToken;
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