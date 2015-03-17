define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleAuthFB',
	'LocaleAuthGPlus',
	'LocaleUserAuthModel',
	'LocaleUtilities',
	'LocaleRouter',
	'LocaleSocket'
], function($, _, Backbone, Bootstrap, LocaleAuthFB, LocaleAuthGPlus, LocaleUserAuthModel, LocaleUtilities, LocaleRouter, LocaleSocket){

	var FBPolicy;
	var GPlusPolicy;

	var View,
		UserModel,
		AuthPolicy;

	var Initialize = function (AuthView) {
		View = AuthView;

		FBPolicy = new LocaleAuthFB();
		GPlusPolicy = new LocaleAuthGPlus();

		FBPolicy.Initialize();
		GPlusPolicy.Initialize();
	}

	var GetAuthState = function() {
		return AuthPolicy.GetAuthState();
	}

	var GetAuthToken = function() {
		return AuthPolicy.GetAuthToken();
	}

	var HandleLogin = function(response) {
		if(response.UserLoggedIn === true)
		{
			// User logged in. Aquire more minerals
			AuthPolicy.GetUserData(UserModel, function(data) {
				// Pass data to view
				LocaleSocket.Emit('join', JSON.stringify(UserModel));
				View.loggedin();
			})
		}
		else if(response.UserAuthed === true)
		{
			// user did not log in
			console.log("User entered invalid login details");
		}
		else if(response.ConnectedToPlatform === true)
		{
			// user did not authorize
			window.location.href = "https://www.facebook.com/dialog/oauth?client_id=" + AppToken + "&redirect_uri=" + RedirectURL;
		}
		else
		{
			// user did not connect to fb at all
			console.log("Fatal login error");
		}
	}

	var Login = function() {
		UserModel = new LocaleUserAuthModel({
			id: 1, location: { lat: LocaleUtilities.GetCurrentLocation().coords.latitude, 
			lon: LocaleUtilities.GetCurrentLocation().coords.longitude }, 
			firstName: "John", lastName: "Doe", token: AuthToken, email: "email@email.com",
			profileUrl: "assets/profilepic/placeholder.png"
		});

		AuthPolicy.Login(HandleLogin);
	}

	var LoginFacebook = function() {
		AuthPolicy = FBPolicy;

		Login();
	}

	var LoginGooglePlus = function() {
		AuthPolicy = GPlusPolicy;

		Login();
	}


	var Logout = function() {
		//LogoutFacebook();
		//LogoutGooglePlus();
	}

	var EnsureAuthed = function() {
		if(GetAuthState() === false)
		{
			// View should move back to login page
		}
	}

	var GetUserModel = function() {
		return UserModel;
	}

	var GetPlatformData = function() {
		return AuthPolicy.GetPlatformData();
	}
	
	// Map public API functions to internal functions
	return {
		Initialize: Initialize,
		GetAuthState: GetAuthState,
		GetAuthToken: GetAuthToken,
		LoginFacebook: LoginFacebook,
		LoginGooglePlus: LoginGooglePlus,
		Logout: Logout,
		EnsureAuthed: EnsureAuthed,
		GetUserModel: GetUserModel,
		GetPlatformData: GetPlatformData
	};
});