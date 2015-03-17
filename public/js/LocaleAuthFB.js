define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleUtilities',
	'facebook',
], function($, _, Backbone, Bootstrap, LocaleUtilities){

	var AppToken = 616102381854407,
		RedirectURL = "http://getlocale.me",
		AuthToken = undefined,
		LoggedIn = false,
		Authorized = false,
		CachedResponse = undefined,
		ConnectedToFacebook = false;

	var GetPlatformData = function() {
		return {
			UserAuthed: Authorized,
			UserLoggedIn: LoggedIn,
			ConnectedToPlatform: ConnectedToFacebook
		}
	};

	var FBAuthStateChanged =  function(response) {
		CachedResponse = response;

		if(response.status === 'connected')
		{
			AuthToken = response.authResponse.accessToken;

			console.log("connected to fb by cache");

			LoggedIn = true;
			Authorized = true;
			ConnectedToFacebook = true;
		}
		else if(response.status === 'not_authorized')
		{
			ConnectedToFacebook = true;
			Authorized = false;
		}
		else
		{
			Authorized = false;
			ConnectedToFacebook = false;
		}
	}

	var FBAuthPolicy = 	function() {

		var Initialize = function() {
			FB.init( {
				appId      : AppToken,
	      		xfbml      : true,
	      		version    : 'v2.2'
	      	});

	      	FB.getLoginStatus(function(response) {
	      		FBAuthStateChanged(response);
	      	});
		};

		var Login = function(callback) {

			/*
			if(ConnectedToFacebook === false)
			{
				callback(GetPlatformData);
			}
			else if(Authorized === false)
			{
				callback(GetPlatformData);
			}
			*/
			if(LoggedIn === false)
			{
				FB.login(function(response) {
					if(response.authResponse) {
						console.log("connected to fb by login");
						AuthToken = response.authResponse.accessToken;
						LoggedIn = true;
						ConnectedToFacebook = true;
						Authorized = true;
					}
					else
					{
						console.log("User did not authenticate");
					}
					callback(GetPlatformData());

				}, { scope: 'public_profile' });
			}
			else
			{	
				// If we're here, we're logged in already
				callback(GetPlatformData());
			}
		};

		var GetUserData = function(model, callback) {

			FB.api('/me', function(response) {
					
				model.set("id", response.id);
				model.set("location", { lat: LocaleUtilities.GetCurrentLocation().coords.latitude, lon: LocaleUtilities.GetCurrentLocation().coords.longitude });
				model.set("firstName", response.first_name);
				model.set("lastName", response.last_name);
				model.set("email", response.email);

				callback(model);
			});
		};

		var LoadProfilePicture = function(callback) {
			FB.api(
			    "/me/picture",
			    {
			        "redirect": false,
			        "height": 60,
			        "width": 60,
			        "type": "small"
			    },
			    function (response) {
					if (response && !response.error) {
						callback(response);
					}
			    }
			);
		};

		var GetAuthToken = function() {
			return AuthToken;
		};

		var GetAuthState = function() {
			return LoggedIn;
		};

		return {
			Initialize: Initialize,
			Login: Login,
			GetUserData: GetUserData,
			LoadProfilePicture: LoadProfilePicture,
			GetAuthToken: GetAuthToken,
			GetAuthState: GetAuthState,
			GetPlatformData: GetPlatformData,
			LoadProfilePicture: LoadProfilePicture
		}
	};

	return FBAuthPolicy;
});