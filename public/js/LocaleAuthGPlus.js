define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleUtilities',
	'google'
], function($, _, Backbone, Bootstrap, LocaleUtilities){

	var AppToken = undefined
		RedirectURL = "http://getlocale.me",
		AuthToken = undefined,
		LoggedIn = false,
		Authorized = false,
		CachedResponse = undefined,
		ConnectedToGPlus = false;

	var GetPlatformData = function() {
		return {
			UserAuthed: Authorized,
			UserLoggedIn: LoggedIn,
			ConnectedToPlatform: ConnectedToGPlus
		}
	};

	var AuthGPlusPolicy = function() {

		var Initialize = function() {

		};

		var Login = function(callback) {
			if(LoggedIn === false)
			{
				var SigninData = { 'callback': function(response) {
						if(response['status']['signed_in']) {
							Authorized = true;
							LoggedIn = true;
							ConnectedToGPlus = true;
							console.log("connected by g+");
						}
						else
						{
							console.log("failed to connect to g+");
							if(response['error'] === "user_signed_out")
							{
								ConnectedToGPlus = true;
								Authorized = false;
								LoggedIn = false;
								console.log("reason: user signed out");
							}
							else if(response['error'] === "access_denied")
							{
								ConnectedToGPlus = false;
								Authorized = false;
								LoggedIn = false;
								console.log("reason: access denied");
							}
							else if(response['error'] === "immediate_failed")
							{
								ConnectedToGPlus = false;
								Authorized = false;
								LoggedIn = false;
								console.log("reason: immediate failed");
							}
						}
						callback(GetPlatformData());
					},
					'clientid': '106086389634-8fung5dqijsg6nobsqn0g5b3n865vj7v.apps.googleusercontent.com',
					'cookiepolicy': 'single_host_origin',
					'requestvisibleactions': 'http://schema.org/AddAction',
					'scope': 'https://www.googleapis.com/auth/plus.profile.emails.read'
				};

				gapi.auth.signIn( 
					SigninData
				);
			}
			else
			{	
				// If we're here, we're logged in already
				callback(GetPlatformData());
			}
		};

		var Authorize = function() {

		}

		var GetUserData = function(model, callback) {
			gapi.client.load('plus', 'v1', function() {
				var request = gapi.client.plus.people.get({
			  		'userId' : 'me'
				});

				request.execute(function(response) {
					model.set("id", response.id);
					model.set("location", { lat: LocaleUtilities.GetCurrentLocation().coords.latitude, lon: LocaleUtilities.GetCurrentLocation().coords.longitude });
					model.set("firstName", response.name.givenName);
					model.set("lastName", response.name.familyName);
					model.set("email", response.emails[0].value);
					model.set("profileUrl", response.image.url);

					callback(model);
				});
			});
		};

		var LoadProfilePicture = function(model, callback) {
			// Already loaded from GetUserData
			callback(model);
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
			Authorize: Authorize,
			GetUserData: GetUserData,
			LoadProfilePicture: LoadProfilePicture,
			GetAuthToken: GetAuthToken,
			GetAuthState: GetAuthState,
			GetPlatformData: GetPlatformData,
			LoadProfilePicture: LoadProfilePicture
		}
	};

	return AuthGPlusPolicy;
});