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
	'LocaleAuth',
	'async!http://maps.google.com/maps/api/js?sensor=false!callback'
], function($, _, Backbone, Bootstrap, LocaleUtilities, LocaleProfileView, LocaleChatroomListView, LocaleChatModel, LocaleChatroomCollection, LocaleSearchModel, LocaleSocket, LocaleAuth, GMaps){

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
						_.each(data.messages.reverse(), function(message) {
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
			LocaleAuth.GetProfilePicture(function(response) {

				ProfileView.setProfilePic(response.data.url);
				LocaleSocket.Emit('join', JSON.stringify(LocaleAuth.GetUserModel()));
			})

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
			this.getValue(function(value, collection, view){

				var matches = [];

				_.each(collection.models, function(chat) {
					var tags = chat.get("tags");
					if(tags.length > 0)
					{
						var cleanTags = _.map(tags, function(clean) {
							return $.trim(clean);
						});

						var tagsArr = value.split(' ');
						

						_.each(tagsArr, function(tag) {

							var ind = cleanTags.indexOf(tag);
							if(ind > -1)
							{
								matches.push( { tag: cleanTags[ind], model: chat });
							}
						}, this);
					}
				});

				if(matches.length > 0)
					view.doSearchDropdown(matches, view);

			}, ChatroomCollection, this);
		},

		doSearchDropdown: function(tags, view) {
			/*console.log("Found matches: " + tags);*/
			$('.waypoint-info').empty();
			$('.waypoint-info').addClass("btn-group-vertical");
			$('.waypoint-info').attr("role", "group");
			$('.waypoint-info').css({display: "block"});

			//htmlContainer = '<ul>';
			view.adjustMap(tags, function(obj){
				console.log(JSON.stringify(obj));
				//console.log(obj.get("location")["latitude"]);
				Map.panTo(new google.maps.LatLng(obj.get("location")["latitude"], obj.get("location")["longitude"]))
				var name = '<h4>' + obj.get("name") + '</h4>';
			   	var description = "We are a group of runners in our 20's and 30's, with members ranging from beginner runners to those who have been running for years. Nothing like knowing others are waiting for you to make sure you go out and run!";
			   	var buttonHTML;
			   	if(obj.get("canJoin")){
			   		buttonHTML = '<button type="button" class="btn btn-success waypoint-join" data-name= "' +  obj.get("name") +'">Join</button>';
			   	} else {
			   		buttonHTML = '<button type="button" class="btn btn-success waypoint-join" disabled="disabled" data-name= "' +  obj.get("name") +'">Out of Range</button>'
			   	}

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
			
			//console.log("Found match: " + tag.tag + " to object " + tag.model.get("name"));
		},

		adjustMap: function(tags, callback) {
			_.each(tags, function(tag) {
				$('<button/>', {
					'class' : 'btn btn-default searchelement',
					'text' : tag.model.get("name")
				}).on('click', function(){
					callback(tag.model);
				}).appendTo('.waypoint-info');
				//htmlContainer += '<li>' + tag.tag + '</li>';
			});
		},

		getValue: function(callback, collection, searchCallback){
			if(timer !== undefined){
				clearTimeout(timer);
				timer = undefined;
			}
			timer = setTimeout(function() {
				searchQuery = $('#search-content').val();
				callback(searchQuery, collection, searchCallback);
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