define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleUtilities',
	'LocaleProfileView',
	'LocaleSearchModel',
	'LocaleSocket',
	'async!http://maps.google.com/maps/api/js?sensor=false!callback'
], function($, _, Backbone, Bootstrap, LocaleUtilities, LocaleProfileView, LocaleSearchModel, LocaleSocket, GMaps){

	var ProfileView;

	var Map,
		CurrentPosition = undefined;

	var mapOptions = {
		  zoom: 13,
		  mapTypeId: google.maps.MapTypeId.ROADMAP,
		  disableDefaultUI: true
	};

	var LocaleMapView = Backbone.View.extend({
		el: '#mappage',

		events: {
			'click #do-search' : 'search',
		},

		initialize: function() {
			ProfileView = new LocaleProfileView();
			
			Map = new google.maps.Map(this.$el.find("#map-wrapper")[0], mapOptions);

			LocaleSocket.Handle('updaterooms', function(rooms, current) {
				LocaleMapView.renderRooms(rooms, current);
				console.log("update rooms");
			});
		},

		render: function() {
			// Failed to get position, do nothing
			LocaleUtilities.GetCurrentLocation(function(position) {
				CurrentPosition = position;

			      var pos = new google.maps.LatLng(CurrentPosition.coords.latitude,
			                                       CurrentPosition.coords.longitude);

	      		Map.setCenter(pos);
			});
		},

		renderRooms: function(rooms, current) {
			console.log(rooms);

			$.each(rooms, function(key, value) {

				var pos = { latitude: value.location.latitude, longitude: value.location.longitude };
				console.log(pos);

				if(value == current) {

				}
				else
				{

				}

			     var marker = new google.maps.Marker({
				      position: pos,
				      map: Map
				  });

				  google.maps.event.addListener(marker, 'mouseover', function() {
				    //display info about the room if it is a room, or if it is you, display your info.
				    console.log("hovered");
				});

				  google.maps.event.addListener(marker, 'mouseout', function() {
				    //remove whatever info was displayed
				    console.log("unhovered");
				});

				  google.maps.event.addListener(marker, 'click', function() {
				   	//Pan to and do hovered
				    Map.panTo(marker.getPosition());
				    console.log("clicked");
				});

				var circle = new google.maps.Circle({
					center: pos,
					radius: value.radius, //Measured in meters
					fillColor: "#758ff9",
					fillOpacity: 0.5,
					strokeOpacity: 0.0,
					strokeWidth: 0,
					map: Map
				});
			});
		},

		search: function() {
			console.log(this.$el.find("#search-content").val());
		},

		getLocation: function() {
			return CurrentPosition;
		}
	});

	return LocaleMapView;
});