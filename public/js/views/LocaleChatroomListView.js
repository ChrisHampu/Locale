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

			Rooms = [];

			this.$el.html("");
			$("#chatarea").html("");

			var parent = this;

			_.each(this.collection.models, function(element) {
				var RoomView = new LocaleChatroomView ( { model: element, parent: parent });
				
				this.$el.append(RoomView.renderButton().$el);

				if(element.get("joined") === true)
					$("#chatarea").append(RoomView.getRoomWindow().render().$el);

				this.Rooms.push(RoomView);
			}, this);
		},

		renderSingle: function(RoomView) {
			this.$el.append(RoomView.renderButton().$el);
			
			if(RoomView.model.get("joined") === true)
				$("#chatarea").append(RoomView.getRoomWindow().render().$el);
		},

		add: function(room) {
			var RoomView = new LocaleChatroomView ( { model: room, parent: this });

			this.$el.append(RoomView.renderButton().$el);
			
			if(room.get("joined") === true)
				$("#chatarea").append(RoomView.getRoomWindow().render().$el);

			this.Rooms.push(RoomView);
		},

		remove: function(room) {
			this.collection.remove(room.model);
			delete room;
			this.render();
		},

		getRooms: function() {
			return this.Rooms;
		}
	});

	return LocaleChatroomListView;
});