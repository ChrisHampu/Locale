require.config({
	baseUrl: "js/", // Base directory for this application
	shim: {
		bootstrapjs: { "deps" : ['jquery'] }
	},
	paths: {
		// Load all of the common modules
		jquery: 'libs/jquery/jquery',
		underscore: 'libs/underscore/underscore',
		backbone: 'libs/backbone/backbone',
		async: 'libs/require/async',
		bootstrapjs: 'libs/bootstrap/bootstrap.min',
		Locale: 'Locale'
	}
});

// Load our app once configuration is complete
require([
	// app.js will be loaded and passed as the object APP
	'app',
], function(App){
	// App entry point
	App.Initialize();
});