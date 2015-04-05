require.config({
	baseUrl: "js/", // Base directory for this application
	shim: {
		bootstrapjs: { 
			"deps" : ['jquery']
		},
		facebook: { 
			exports: 'FB' 
		},
		google: { 
			exports: 'gapi' 
		},
		handlebars: {
		  exports: 'Handlebars'
		},
		backbone: {
		  exports: 'Backbone',
		  deps: ['jquery', 'underscore']
		},
		underscore: {
		  exports: '_'
		},
		thorax: {
		  exports: 'Thorax',
		  deps: ['handlebars', 'backbone']
		},
	},
	paths: {
		// Load all of the common modules
		jquery: 'libs/jquery/jquery',
		underscore: 'libs/underscore/underscore',
		backbone: 'libs/backbone/backbone',
		async: 'libs/require/async',
		facebook : '//connect.facebook.net/en_US/sdk',
		bootstrapjs: 'libs/bootstrap/bootstrap',
		handlebars: 'libs/handlebars/handlebars',
		thorax: 'libs/thorax/thorax',
		text: 'libs/text/text',
		hbs: 'libs/requirejs-hbs/hbs',
		socketio: 'libs/socketio/socket.io',
		Locale: 'Locale',
		LocaleRouter: 'LocaleRouter',
		LocaleView: 'views/LocaleView',
		LocaleAuthFB: 'LocaleAuthFB',
		LocaleAuthGPlus: 'LocaleAuthGPlus',
		LocaleAuthView: 'views/LocaleAuthView',
		LocaleMapView: 'views/LocaleMapView',
		LocaleSearchModel: 'models/LocaleSearchModel',
		LocaleChatModel: 'models/LocaleChatModel',
		LocaleChatUserModel: 'models/LocaleChatUserModel',
		LocaleChatroomView: 'views/LocaleChatroomView',
		LocaleChatroomListView: 'views/LocaleChatroomListView',
		LocaleProfileView: 'views/LocaleProfileView',
		LocaleUserAuthModel: 'models/LocaleUserAuthModel',
		LocaleUtilities: 'LocaleUtilities',
		sidr: 'libs/sidr/jquery.sidr.min',
		LocaleSocket: 'LocaleSocket',
		LocaleChatroomCollection: 'collections/LocaleChatroomCollection',
		LocaleChatroomMessageCollection: 'collections/LocaleChatroomMessageCollection',
		LocaleChatWindowView: 'views/LocaleChatWindowView',
		LocaleChatMessageModel: 'models/LocaleChatMessageModel',
		google: 'https://apis.google.com/js/client:platform'
	}
});

// Load our app once configuration is complete
require([
	// app.js will be loaded and passed as the object APP
	'app',
], function(App){
	// App entry point
	$(function() {
		App.Initialize();
	});
});