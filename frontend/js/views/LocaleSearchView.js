define([
	'jquery',
	'thorax',
	'bootstrapjs',
	'LocaleSearchModel',
	'hbs!templates/LocaleSearchView',
	'hbs!templates/LocaleSearchResults'
], function($, Thorax, Bootstrap, LocaleSearchModel, SearchTemplate, SearchResTemplate){

	var self = undefined;

	var timer = undefined;

	var searchQuery;

	var searchHelperView = Thorax.CollectionView.extend({
		name: "SearchHelperView",

		context: function(model) {
			return this.parent.model.attributes;
		},

		itemContext: function(model, i) {
			return model.attributes;
		},

		appendItem: function() {
		},

		template: SearchResTemplate,
		itemTemplate: Handlebars.compile('{{#button trigger="viewSearchResult" class="btn btn-default searchelement"}}{{name}}{{/button}}')
	});

	var LocaleSearchView = Thorax.View.extend({

		name: "SearchView",

		events: {
			'keydown #searchbar' : 'search',
			'click #searchbar' : 'search'
		},

		template: SearchTemplate,

		collection: new Thorax.Collection(),

		initialize: function() {
			// For use in events and callbacks
			self = this;

			// Register as a child
			this.searchResults = this._addChild(new searchHelperView());

			// Helper function for triggering a render
			this.searchResults.listenTo(this, "showResults", function() {
				self.searchResults.render();
			})

			// Listen to events on the helper view but call our own function
			this.listenTo(this.searchResults, 'click .waypoint-join', this.join);
			this.listenTo(this.searchResults, 'click .waypoint-info-dismiss', this.dismiss);
			this.listenTo(this.searchResults, 'viewSearchResult', this.searchResult);

			// Let this view's collection manage the helper view
			this.searchResults.setCollection(self.collection);

			this.model.on("change", function() {
				// Reset collection so the waypoint info section renders,
				// which happens when the collection is empty
				self.searchResults.collection.reset();

				// Now re-render to display waypoint info
				self.searchResults.render();
			});
		},

		context: function() {
			if(this.model === undefined)
				return {};
			return this.model.attributes;
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

		// Called when a search result is clicked
		searchResult: function(e) {
			var model = this.parent.getListView().collection.findWhere({name: $(e.target).model().get("name")});
			this.updateMarkerInfo(model);

			// TODO: Pan map when clicking a button
			//Map.panTo(new google.maps.LatLng(obj.get("location")["latitude"], obj.get("location")["longitude"]))
		},

		// Reset results
		search: function(e) {

			if(e.which == 8) // Backspace
				self.collection.reset();

			this.getValue(function(value, collection, view) {

				var matches = [];

				_.each(collection.models, function(chat) {
					var tags = chat.get("tags");

					if(tags.length > 0)
					{
						// tags from rooms
						var roomTags = tags.split("#");
						roomTags.splice(0,1);

						var cleanTags = _.map(roomTags, function(clean) {
							return $.trim(clean);
						});

						// tags from input
						var tagsArr = _.compact(_.uniq(value.split(' ')));

						for(var i = 0; i < tagsArr.length; i++) {

							var ind = cleanTags.indexOf(tagsArr[i]);
							if(ind > -1) {
								matches.push( { tag: cleanTags[ind], name: chat.get("name") });
								break;
							}
						}
					}
				});

				if(matches.length > 0)
					view.doSearchDropdown(matches, view);

			}, self.parent.getListView().collection, this);
		},

		doSearchDropdown: function(tags, view) {

			$('.waypoint-info').css({display: "block"});
			
			var addTags = [];

			_.each(tags, function(tag) {
				if(self.collection.where({name: tag.name}).length === 0)
					self.collection.add(new Thorax.Model({name: tag.name}));
			});

			self.trigger("showResults");
		},

		getValue: function(callback, collection, searchCallback){

			var searchQuery = $('#search-content').val();

			if(timer !== undefined){
				clearTimeout(timer);
				timer = undefined;
			}
			timer = setTimeout(function() {
				callback(searchQuery, collection, searchCallback);
				$("#searchbar").val("");
			},500);
		},

		updateMarkerInfo: function(locale) {
			var Locale = locale.attributes;

			self.searchResults.collection.reset();
			self.model.set({name: Locale.name, description: Locale.description, canJoin: Locale.canJoin});

		    $('.waypoint-info').css({display: "block"});
		    $('.waypoint-info').stop().animate({height: "250px"}, 500);
		}
	});

	return LocaleSearchView;
});