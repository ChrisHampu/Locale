define([
	'jquery',
	'thorax',
	'bootstrapjs',
	'LocaleSearchModel',
	'hbs!templates/LocaleSearchView'
], function($, Thorax, Bootstrap, LocaleSearchModel, SearchTemplate){

	var LocaleSearchView = Thorax.View.extend({

		name: "SearchView",

		events: {
			'click .waypoint-join' : 'join',
			'click .waypoint-info-dismiss' : 'dismiss',
			'keypress #searchbar' : 'search',
			'click #searchbar' : 'search'
		},

		template: SearchTemplate,

		initialize: function() {

		},

		join: function(e) {
			$('.waypoint-info').stop().animate({height: "0px"}, function(){
				$('.waypoint-info').css("display", "none");
			});

			var name = $(e.currentTarget).data()["name"];
			_.each(this.parent.getListView().getRooms(), function(chat) {
				var roomName = chat.model.get("name");
				if(roomName === name)
				{	
					chat.join();
				}
			});
		},

		dismiss: function(){
			$('.waypoint-info').stop().animate({height: "0px"}, function(){
				$('.waypoint-info').css("display", "none");
			});
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
		}
		
	});

	return LocaleSearchView;
});