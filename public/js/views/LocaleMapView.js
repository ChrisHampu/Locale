define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleUtilities',
	'LocaleProfileView',
	'LocaleChatroomListView',
	'LocaleChatModel',
	'LocaleChatroomCollection',
	'LocaleSearchModel',
	'LocaleSocket',
	'async!http://maps.google.com/maps/api/js?sensor=false!callback'
], function($, _, Backbone, Bootstrap, LocaleUtilities, LocaleProfileView, LocaleChatroomListView, LocaleChatModel, LocaleChatroomCollection, LocaleSearchModel, LocaleSocket, GMaps){

	var ProfileView,
		ChatroomListView,
		ChatroomCollection;

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
			'click .waypoint-join' : 'join'
		},

		initialize: function() {
			ProfileView = new LocaleProfileView();

			ChatroomCollection = new LocaleChatroomCollection();
			ChatroomListView = new LocaleChatroomListView( { collection: ChatroomCollection } );
			
			Map = new google.maps.Map(this.$el.find("#map-wrapper")[0], mapOptions);

			LocaleSocket.Handle('loadroom', function(data) {

				_.each(ChatroomListView.getRooms(), function(chat) {
					var roomName = chat.model.get("name");
					var dataName = data.room;
					if(roomName === dataName)
					{
						_.each(data.messages, function(message) {
							chat.addMessage(message);
						});
					}
				});
			});
		},

		render: function() {
			ProfileView.render();
			
			// Failed to get position, do nothing
			LocaleUtilities.GetCurrentLocation(function(position) {
				CurrentPosition = position;

			      var pos = new google.maps.LatLng(position.coords.latitude,
			                                       position.coords.longitude);

			     var marker = new google.maps.Marker({
				      position: pos,
				      map: Map,
				      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
				  });

	      		Map.setCenter(pos);
			});
		},

		renderRooms: function(rooms, current) {
			$.each(rooms, function(key, value) {
				console.log(value);
				var pos = new google.maps.LatLng(value.location.latitude, value.location.longitude);

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
				   	var numUsers = '<strong> ' + value.users + '</strong>';
				   	var name = '<h4>' + value.name + '</h4>';
				   	var description = "Description";


				    Map.panTo(marker.getPosition());
				    console.log("clicked");
				    $('.waypoint-info').css({display: "block"});
				    $('.waypoint-info').stop().animate({height: "125px"});
				    $('.waypoint-info').html('<div class="chatbox-icon"></div>'
				    	+'<div class="waypoint-name">'
				    		 + name 
				    	+ '</div>' 
				    	+ '<div class="waypoint-description">' 
				    		+   description
				    	+ '</div>'
				    	+ '<div class="waypoint-numUsers"><i class="fa fa-users fa-lg"></i>' 
				    		+ numUsers 
				    	+ '</div>'
				    	+ '<button type="button" class="btn btn-success waypoint-join" data-name= "' +  value.name +'">Join</button>');
					
				});

				var circle = new google.maps.Circle({
					center: pos,
					radius: parseInt(value.radius), //Measured in meters
					fillColor: "#AEBDF9",
					fillOpacity: 0.5,
					strokeOpacity: 0.0,
					strokeWidth: 0,
					map: Map
				});

				google.maps.event.addListener(circle, "click", function() {
					var pulse = new google.maps.Circle({
						center: pos,
						radius: 1,
						strokeColor: "#758ff9",
						strokeOpacity: 1,
						strokeWeight: 3,
						fillColor: "#758ff9",
						fillOpacity: 0
					});
					pulse.setMap(Map);

					var direction = 1;
					var rMin = 1, rMax = parseInt(value.radius);
					setInterval(function() {
						var radius = pulse.getRadius();
						if (radius > rMax) {
							pulse.setMap(null);
						}
						pulse.setRadius(radius + 5);
					}, 10);
				})

				ChatroomCollection.add( new LocaleChatModel( { location: value.location, name: value.name, radius: value.radius }));
			});
		},

		search: function() {
			console.log(this.$el.find("#search-content").val());
		},

		getLocation: function() {
			return CurrentPosition;
		},
		
		getProfileView: function() {
			return ProfileView;
		},

		join: function(e) {
			var name = $(e.currentTarget).data()["name"];
			_.each(ChatroomListView.getRooms(), function(chat) {
				var roomName = chat.model.get("name");
				if(roomName === name)
				{	
					console.log("joined chat" + roomName);
					chat.join();
				}
			});
		}
	});

	return LocaleMapView;
});