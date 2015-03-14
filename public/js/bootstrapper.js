require.config({
	baseUrl: "js/", // Base directory for this application
	shim: {
		bootstrapjs: { "deps" : ['jquery'] },
		facebook: { exports: 'FB' }
	},
	paths: {
		// Load all of the common modules
		jquery: 'libs/jquery/jquery',
		underscore: 'libs/underscore/underscore',
		backbone: 'libs/backbone/backbone',
		async: 'libs/require/async',
		facebook : 'http://connect.facebook.net/en_US/sdk',
		bootstrapjs: 'libs/bootstrap/bootstrap.min',
		Locale: 'Locale',
		LocaleRouter: 'LocaleRouter',
		LocaleView: 'views/LocaleView',
		LocaleAuthView: 'views/LocaleAuthView',
		LocaleMapView: 'views/LocaleMapView'
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