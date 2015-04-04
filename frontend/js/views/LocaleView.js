define([
	'jquery',
	'thorax',
	'bootstrapjs',
	'LocaleSocket',
	'LocaleAuth',
	'LocaleMapView'
], function($, Thorax, Bootstrap, LocaleSocket, LocaleAuth, LocaleMapView){

	var MapView;

	var LocaleView = Thorax.View.extend({
		el: '#wrapper',

		initialize: function() {

			MapView = new LocaleMapView();

			LocaleSocket.Handle('updaterooms', function(rooms, current) {
				MapView.renderRooms(rooms, current);
				console.log("update rooms");
			});
		},

		render: function() {

			if(LocaleAuth.GetAuthState() === true) {
				MapView.render();
				console.log("Rendered map view");
			}
			else
			{
				console.log("Cannot render map. Not authed.")
				LocaleAuth.EnsureAuthed();
			}
		},

		getMapView: function() {
			return MapView;
		}
	});

	return LocaleView;
});