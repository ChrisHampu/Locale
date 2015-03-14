define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleAuth',
	'LocaleMapView'
], function($, _, Backbone, Bootstrap, LocaleAuth, LocaleMapView){

	var MapView;

	var LocaleView = Backbone.View.extend({
		el: '#wrapper',

		initialize: function() {

			MapView = new LocaleMapView();

			this.render();
		},

		render: function() {

			if(LocaleAuth.GetAuthState() === true) {
				MapView.render();
				console.log("Rendered map view");
			}
			else
			{
				this.navigate("", { trigger: true });
			}
		}
	});

	return LocaleView;
});