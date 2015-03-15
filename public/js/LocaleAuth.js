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
		UserModel,
		UsingFB;

	var PopulateFBData = function(callback) {
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
	}

	var PopulateGPlusData = function() {

	}

	var SendAuthModel = function(useFB) {

		UsingFB = useFB;

		if(useFB === true)
		{
			FB.api('/me', function(response) {
				
				UserModel.set("id", response.id);
				UserModel.set("location", { lat: LocaleUtilities.GetCurrentLocation().coords.latitude, lon: LocaleUtilities.GetCurrentLocation().coords.longitude });
				UserModel.set("firstName", response.first_name);
				UserModel.set("lastName", response.last_name);
				UserModel.set("profileUrl", response.profile_url);
				UserModel.set("email", response.email);

				PopulateFBData( function(response) {
					UserModel.set("profile_url", response.data.url);
					LocaleSocket.Emit('join', JSON.stringify(UserModel));
					Locale.SetProfilePic(response.data.url);
				});

			});
		}
		else
		{
			UserModel = new LocaleUserAuthModel({
				id: 1, location: { lat: LocaleUtilities.GetCurrentLocation().coords.latitude, 
				lon: LocaleUtilities.GetCurrentLocation().coords.longitude }, 
				firstName: "John", lastName: "Doe", token: AuthToken, email: "email@email.com" 
			});

			UserModel.set("profile_url", "assets/profilepic/placeholder.png");

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

			SendAuthModel(true);
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
		
		Locale = LocaleApp;

		FB.init( {
			appId      : '616102381854407',
      		xfbml      : true,
      		version    : 'v2.2'
      	});

      	FB.getLoginStatus(function(response) {
      		FBAuthStateChanged(response);
      	});

	    UserModel = new LocaleUserAuthModel();
		
		UserModel.set("profile_url", "assets/profilepic/placeholder.png");
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

	var GetUserModel = function() {
		return UserModel;
	}

	var FinalizeData = function() {
		//PopulateFBData();
		PopulateGPlusData();
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
		FinalizeData: FinalizeData
	};
});