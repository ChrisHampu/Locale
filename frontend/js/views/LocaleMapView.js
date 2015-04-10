define([
	'jquery',
	'thorax',
	'bootstrapjs',
	'LocaleUtilities',
	'LocaleProfileView',
	'LocaleChatroomListView',
	'LocaleChatModel',
	'LocaleSearchModel',
	'LocaleSocket',
	'LocaleAuth',
	'async!http://maps.google.com/maps/api/js?sensor=false!callback'
], function($, Thorax, Bootstrap, LocaleUtilities, LocaleProfileView, LocaleChatroomListView, LocaleChatModel, LocaleSearchModel, LocaleSocket, LocaleAuth, GMaps){

	var ProfileView,
		ChatroomListView;

	var Map,
		CurrentPosition = undefined;

	var timer = undefined;

	var searchQuery;

	var mapOptions = {
		  zoom: 13,
		  mapTypeId: google.maps.MapTypeId.ROADMAP,
		  disableDefaultUI: true
	};

	var mapMarkers = [];

	var LocaleMapView = Thorax.View.extend({
		el: '#mappage',

		name: "MapView",

		events: {
			'click .waypoint-join' : 'join',
			'click .waypoint-info-dismiss' : 'dismiss',
			'keypress #searchbar' : 'search',
			'click #searchbar' : 'search'
		},

		initialize: function() {
			ProfileView = new LocaleProfileView();

			ChatroomListView = new LocaleChatroomListView();
			
			Map = new google.maps.Map(this.$el.find("#map-wrapper")[0], mapOptions);

			LocaleSocket.Handle('deletelocale', function(roomName) {
				_.each(ChatroomListView.getRooms(), function(chat) {

					if(chat.model.get("name") === roomName)
					{
						ChatroomListView.deleteRoom(chat);
					}
				});

				// Remove room marker
				var mapIndex = -1;

				// Find the marker
				for(var i = 0; i < mapMarkers.length; i++) {
					if(mapMarkers[i].name === roomName) {
						mapIndex = i;
						break;
					}
				}

				// Reset the markers by deleting their reference
				if( mapIndex !== -1)
				{
					var localeMarker = mapMarkers[mapIndex];
					mapMarkers.splice(mapIndex, 1);

					localeMarker.map.circle.setMap(null);
					localeMarker.map.marker.setMap(null);

					delete localeMarker.map.circle;
					delete localeMarker.map.marker;
				}
			});

			LocaleSocket.Handle('loadroom', function(data) {

				_.each(ChatroomListView.getRooms(), function(chat) {

					var roomName = chat.model.get("name");
					var dataName = data.room;
					if(roomName === dataName)
					{
						// We don't know what messages we have vs what we're receiving when we load
						// there could be many reasons for inconsistencies.
						// What we do is reset our list of messages, reset the view, and simply
						// re-render all the messages we're being given by the server
						chat.resetMessages();

						_.each(data.messages, function(message) {
							chat.addMessage(message);
						});

						chat.updateUsers(data.users);
						//console.log("Room " + data.room + " has users " + data.users);
					}
				});
			});

			LocaleSocket.Handle('updateroomusers', function(rooms) {

				_.each(ChatroomListView.getRooms(), function(chat) {

					_.each(rooms, function(room) {
						var chatName = chat.model.get("name");
						var roomName = room.name;

						if(chatName === roomName)
						{
							chat.updateUsers(room.users);
						}

					});
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
			ChatroomListView.render();

			LocaleAuth.GetProfilePicture(function(model) {

				ProfileView.setProfilePic(model.get("profilePicture"));
				LocaleSocket.Emit('updateuser', { profilePicture: model.get("profilePicture") });
			});

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
				
				// If this is set, it means the backend is telling us to update an existing room.
				// What we do here is remove the room to force it to un-render, update the model,
				// and the rest of the code after this block will make a new waypoint, add the updated model,
				// and re-render it
				if(value.updateRoom !== undefined)
				{
					var updatingLocale = ChatroomListView.collection.findWhere( { name: value.updateRoom} );

					if(updatingLocale !== undefined)
					{
						ChatroomListView.collection.remove(updatingLocale);
						//ChatroomListView.remove()
						this.removeMarker(value.updateRoom);

						updatingLocale.set("name", value.name);
						updatingLocale.set("description", value.description);
						updatingLocale.set("tags", value.tags);
						updatingLocale.set("privacy", value.privacy);

						value = _.clone(updatingLocale.attributes);
					}
				}

				// Disallow duplicates
				var exists = ChatroomListView.collection.where( { name: value.name} );
		
				if(exists.length === 0)
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

					this.removeMarker(value.name);

					mapMarkers.push( { name: value.name, map : { circle: circle, marker: marker} });

					ChatroomListView.add( new LocaleChatModel( { location: value.location, name: value.name, radius: value.radius, 
						canJoin: value.canJoin, userCount: value.userCount, tags: value.tags, description: value.description,
						privacy: value.privacy }));
				}

			}, this);
		},

		removeMarker: function(localeName) {
			var mapIndex = -1;

			// Find the marker
			for(var i = 0; i < mapMarkers.length; i++) {
				if(mapMarkers[i].name === localeName) {
					mapIndex = i;
					break;
				}
			}

			// Reset the markers by deleting their reference
			if( mapIndex !== -1)
			{
				var localeMarker = mapMarkers[mapIndex];
				mapMarkers.splice(mapIndex, 1);

				localeMarker.map.circle.setMap(null);
				localeMarker.map.marker.setMap(null);

				delete localeMarker.map.circle;
				delete localeMarker.map.marker;
			}
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
			   	var description = obj.get("description");
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