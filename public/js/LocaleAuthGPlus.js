define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleUtilities'
], function($, _, Backbone, Bootstrap, LocaleUtilities){

	var AppToken = undefined
		RedirectURL = "http://getlocale.me",
		AuthToken = undefined,
		LoggedIn = false,
		Authorized = false,
		CachedResponse = undefined,
		ConnectedToFacebook = false;

	var AuthGPlusPolicy = function() {

		var Initialize = function() {

		};

		var Login = function(callback) {
			callback(this.GetPlatformData());
		};

		var GetPlatformData = function()
		{
			return {
				UserAuthed: Authorized,
				UserLoggedIn: LoggedIn,
				ConnectedToPlatform: ConnectedToFacebook
			}
		};

		var GetUserData = function(model, callback) {
			callback(model);
		};

		var LoadProfilePicture = function(callback) {
			callback(undefined);
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

	return AuthGPlusPolicy;
});