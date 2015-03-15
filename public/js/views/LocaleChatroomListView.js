define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleChatroomView'
], function($, _, Backbone, Bootstrap, LocaleChatroomView){

	var LocaleChatroomListView = Backbone.View.extend({
		el: '#my-room-container',

		events: {
			
		},

		initialize: function() {
			this.$el.html(""); // Remove dummy data
			$("#chatarea").html("");
			this.listenTo(this.collection, "add", this.add);
			this.Rooms = [];
		},

		render: function() {
			
			this.$el.html("");
			$("#chatarea").html("");

			var parent = this;

			_.each(this.Rooms, function(View) {
				this.renderSingle(View);
			}, this);
		},

		renderSingle: function(RoomView) {
			this.$el.append(RoomView.renderButton().$el);
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
			console.log(room);
			var RoomView = new LocaleChatroomView ( { model: room, parent: this });

			this.$el.append(RoomView.renderButton().$el);
			
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
		}
	});

	return LocaleChatroomListView;
});