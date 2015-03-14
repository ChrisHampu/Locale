define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleSearchModel',
	'async!http://maps.google.com/maps/api/js?sensor=false!callback'
], function($, _, Backbone, Bootstrap, LocaleSearchModel, GMaps){

	var Map,
		CurrentPosition = undefined;

	var mapOptions = {
		  zoom: 13,
		  mapTypeId: google.maps.MapTypeId.ROADMAP,
		  disableDefaultUI: true
	};

	var LocaleAuthView = Backbone.View.extend({
		el: '#mappage',

		events: {
			'click #do-search' : 'search',
		},

		initialize: function() {

			Map = new google.maps.Map(this.$el.find("#map-wrapper")[0], mapOptions);

			if(navigator.geolocation)
			{
				navigator.geolocation.getCurrentPosition(function(position) {
					CurrentPosition = position;
				}, function() {
			      handleNoGeolocation(true);
			    });
			}
		},

		render: function() {
			// Failed to get position, do nothing
			if(CurrentPosition === undefined)
				return;

		      var pos = new google.maps.LatLng(CurrentPosition.coords.latitude,
		                                       CurrentPosition.coords.longitude);

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
				radius: 2000, //Measured in meters
				fillColor: "#758ff9",
				fillOpacity: 0.5,
				strokeOpacity: 0.0,
				strokeWidth: 0,
				map: Map
			});

      		Map.setCenter(pos);
		},

		search: function() {
			console.log(this.$el.find("#search-content").val());
		}
	});

	return LocaleAuthView;
});