define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleChatroomView',
	'LocaleSocket'
], function($, _, Backbone, Bootstrap, LocaleChatroomView, LocaleSocket){

	var LocaleChatroomListView = Backbone.View.extend({
		el: '#my-rooms',

		events: {
			'click #add-locale' : 'createLocale'
		},

		initialize: function() {
			this.$el.find("#my-room-container").html(""); // Remove dummy data
			$("#chatarea").html("");
			this.listenTo(this.collection, "add", this.add);
			this.Rooms = [];
		},

		render: function() {
			
			this.$el.find("#my-room-container").html("");
			$("#chatarea").html("");

			var parent = this;

			_.each(this.Rooms, function(View) {
				this.renderSingle(View);
			}, this);
		},

		renderSingle: function(RoomView) {
			this.$el.find("#my-room-container").append(RoomView.renderButton().$el);
			RoomView.delegateEvents();

			if(RoomView.model.get("joined") === true) {
				$("#chatarea").append(RoomView.getRoomWindow().render().$el);
				RoomView.getRoomWindow().renderAllMessages();
			}

			RoomView.getRoomWindow().delegateEvents();
		},

		add: function(room) {
			if(!room.get("canJoin")){
				return; //Too far away, don't add;
			}
			var RoomView = new LocaleChatroomView ( { model: room, parent: this });

			this.$el.find("#my-room-container").append(RoomView.renderButton().$el);
			
			if(room.get("joined") === true) {
				$("#chatarea").append(RoomView.getRoomWindow().render().$el);
				RoomView.getRoomWindow().renderAllMessages();
			}

			this.Rooms.push(RoomView);
		},

		remove: function(room) {
			room.set("joined", false);

			this.render();
		},

		getRooms: function() {
			return this.Rooms;
		},

		createLocale: function() {
			var name = this.$el.find("#roomName").val();
			var description = this.$el.find("#roomDescription").val();
			var tags = this.$el.find("#roomTags").val();

			if(name === undefined || description === "" || tags === "")
				return;
			
			LocaleSocket.Emit('addroom', {
				"name": name,
				"description" : description,
				"tags" : tags
			});

			console.log("creating locale named " + name);

			this.$el.find("#roomName").val("");
			this.$el.find("#roomDescription").val("");
		}
	});

	return LocaleChatroomListView;
});