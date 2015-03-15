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

	var timer = undefined;

	var searchQuery;

	var mapOptions = {
		  zoom: 13,
		  mapTypeId: google.maps.MapTypeId.ROADMAP,
		  disableDefaultUI: true
	};

	var LocaleMapView = Backbone.View.extend({
		el: '#mappage',

		events: {
			'click .waypoint-join' : 'join',
			'click .waypoint-info-dismiss' : 'dismiss',
			'keypress #searchbar' : 'search',
			'click #searchbar' : 'search'
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

			LocaleSocket.Handle('broadcastchat', function(data) {
				_.each(ChatroomListView.getRooms(), function(chat) {

					var roomName = chat.model.get("name");
					var dataName = data.room;
					if(roomName === dataName)
					{
						chat.addMessage(data, function(location, radius) {

							var pulse = new google.maps.Circle({
								center: new google.maps.LatLng(location.latitude, location.longitude),
								radius: 1,
								strokeColor: "#758ff9",
								strokeOpacity: 1,
								strokeWeight: 3,
								fillColor: "#758ff9",
								fillOpacity: 0
							});
							pulse.setMap(Map);

							var direction = 1;
							var rMin = 1, rMax = parseInt(radius);
							setInterval(function() {
								var radius = pulse.getRadius();
								if (radius > rMax) {
									pulse.setMap(null);
								}
								pulse.setRadius(radius + 5);
							}, 10);
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
			_.each(rooms, function(value) {

				// Disallow duplicates
				var exists = ChatroomCollection.where( { name: value.name} );

				if(exists.length == 0)
				{
					var pos = new google.maps.LatLng(value.location.latitude, value.location.longitude);

				    var marker = new google.maps.Marker({
					      position: pos,
					      map: Map
					  });

					google.maps.event.addListener(marker, 'mouseover', function() {
					    //display info about the room if it is a room, or if it is you, display your info.
					});

					google.maps.event.addListener(marker, 'mouseout', function() {
					    //remove whatever info was displayed
					});

					google.maps.event.addListener(marker, 'click', function() {
					   	//Pan to and do hovered
					   	var name = '<h4>' + value.name + '</h4>';
					   	var description = value.description;
					   	var buttonHTML;
					   	if(value.canJoin){
					   		buttonHTML = '<button type="button" class="btn btn-success waypoint-join" data-name= "' +  value.name +'">Join</button>';
					   	} else {
					   		buttonHTML = '<button type="button" class="btn btn-success waypoint-join" disabled="disabled" data-name= "' +  value.name +'">Out of Range</button>'
					   	}


					    Map.panTo(marker.getPosition());
					    $('.waypoint-info').css({display: "block"});
					    $('.waypoint-info').stop().animate({height: "250px"}, 500);

					    $('.waypoint-info').html(
	                        '<div class="panel panel-default">' +
	                            '<div class="panel-heading">' +
	                                '<div class="chatbox-icon"></div>' +
	                                '<div class="waypoint-name">' +
	                                     name +
	                                '</div>' +
	                            '</div>' +
	                            '<div class="panel-body">' +
	                                '<div class="waypoint-description">' +
	                                    description +
	                                '</div>' +
	                               '<div class="btn-group">' +
	                                    '<button type="button" class="btn btn-default waypoint-info-dismiss">' +
	                                        '<i class="fa fa-angle-up fa-lg"></i>' +
	                                    '</button>' +
	                                    buttonHTML +
	                                '</div>' +
	                            '</div>' +
	                    '</div>');
						
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

					ChatroomCollection.add( new LocaleChatModel( { location: value.location, name: value.name, radius: value.radius, canJoin: value.canJoin, userCount: value.userCount, tags: value.tags }));

				}

			}, this);
		},

		search: function() {
			this.getValue(function(value){
				_.each(ChatroomListView.getRooms(), function(chat) {
					var tags = chat.model.get("tags");
					if(tags.length > 0)
					{
						var tagsArr = value.split(' ');
						_.each(tagsArr, function(tag) {

							var ind = tags.indexOf(tag);
							if(ind > 0)
							{
								console.log("Matched tag " + tag + " to model tag " + tags[ind]);
							}
						});
					}
					else
					{
						console.log("model has no tags");
					}
				});
			});
		},

		getValue: function(callback){
			if(timer !== undefined){
				clearTimeout(timer);
				timer = undefined;
			}
			timer = setTimeout(function() {
				searchQuery = $('#search-content').val();
				callback(searchQuery);
				$("#searchbar").val("");
			},500);
		},

		getLocation: function() {
			return CurrentPosition;
		},
		
		getProfileView: function() {
			return ProfileView;
		},

		join: function(e) {
			$('.waypoint-info').stop().animate({height: "0px"}, function(){
				$('.waypoint-info').css("display", "none");
			});
			var name = $(e.currentTarget).data()["name"];
			_.each(ChatroomListView.getRooms(), function(chat) {
				var roomName = chat.model.get("name");
				if(roomName === name)
				{	
					console.log("joined chat" + roomName);
					chat.join();
				}
			});
		},

		dismiss: function(){
			$('.waypoint-info').stop().animate({height: "0px"}, function(){
				$('.waypoint-info').css("display", "none");
			});
		}
	});

	return LocaleMapView;
});