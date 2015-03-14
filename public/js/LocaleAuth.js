define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleUserAuthModel',
	'LocaleUtilities',
	'LocaleSocket',
	'facebook',
], function($, _, Backbone, Bootstrap, LocaleUserAuthModel, LocaleUtilities, LocaleSocket){

	var IsAuthed = false,
		AuthToken,
		CachedResponse,
		AppToken = 616102381854407,
		RedirectURL = "http://getlocale.me",
		Locale,
		UserModel;

	var SendAuthModel = function(useFB) {

		if(useFB === true)
		{
			FB.api('/me', function(response) {
			    UserModel = new LocaleUserAuthModel({ id: response.id, location: { lat: LocaleUtilities.GetCurrentLocation().coords.latitude, lon: LocaleUtilities.GetCurrentLocation().coords.longitude },
			     firstName: response.first_name, lastName: response.last_name, token: AuthToken, email: response.email });
				
				LocaleSocket.Emit('join', JSON.stringify(UserModel));
			});
		}
		else
		{
			UserModel = new LocaleUserAuthModel({
				id: 1, location: { lat: LocaleUtilities.GetCurrentLocation().coords.latitude, 
				lon: LocaleUtilities.GetCurrentLocation().coords.longitude }, 
				firstName: "John", lastName: "Doe", token: AuthToken, email: "email@email.com" 
			});


			LocaleSocket.Emit('join', JSON.stringify(UserModel));
		}

		// Navigate to actual site
		Locale.OnLoggedIn(UserModel);
	}

	var FBAuthStateChanged = function(response) {
		CachedResponse = response;

		if(response.status === 'connected')
		{
			AuthToken = response.authResponse.accessToken;

			console.log("connected to fb by cache");

			IsAuthed = true;

			SendAuthModel();
		}
		else if(response.status === 'not_authorized')
		{
			// Attempt to authenticate
			window.location.href = "https://www.facebook.com/dialog/oauth?client_id=" + AppToken + "&redirect_uri=" + RedirectURL;
		}
	}

	var GPlusAuthStateChanged = function() {
		AuthToken = "override";

		console.log("connected by G+ override");

		IsAuthed = true;

		// Navigate to actual site
		SendAuthModel();
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
				SendAuthModel();
			}
			else
			{
				console.log("User did not authenticate");
			}
		}, { scope: 'public_profile, user_interests' });
	}

	var LoginGooglePlus = function() {
		GPlusAuthStateChanged();
	}

	var LogoutFacebook = function() {
		if(IsAuthed === true)
			window.location.href = "https://api.facebook.com/restserver.php?method=auth.expireSession&format=json&access_token=" + AuthToken;
	}

	var LogoutGooglePlus = function() {
		IsAuthed = false;
	}

	var Logout = function() {
		LogoutFacebook();
		LogoutGooglePlus();
	}

	var EnsureAuthed = function() {
		if(IsAuthed === false)
		{
			Locale.RedirectLogin();
		}
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize,
		GetAuthState: GetAuthState,
		GetAuthToken: GetAuthToken,
		LoginFacebook: LoginFacebook,
		LoginGooglePlus: LoginGooglePlus,
		Logout: Logout,
		EnsureAuthed: EnsureAuthed
	};
});