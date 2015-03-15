define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleChatroomView'
], function($, _, Backbone, Bootstrap, LocaleChatroomView){

	var LocaleChatroomListView = Backbone.View.extend({
		el: '#room-container',

		events: {
		},

		initialize: function() {
			this.$el.html(""); // Remove dummy data
			$("#chatarea").html("");
			this.listenTo(this.collection, "add", this.add);
		},

		render: function() {
			this.$el.html("");
			$("#chatarea").html("");

			var parent = this;

			var mhtml = this.collection.map( function(room) {
				var RoomView = new LocaleChatroomView ( { model: room, parent: parent });

				return RoomView.renderButton().$el;
			});

			this.$el.append(mhtml);
		},

		add: function(room) {
			var RoomView = new LocaleChatroomView ( { model: room, parent: this });

			this.$el.append(RoomView.renderButton().$el);
			
			$("#chatarea").append(RoomView.getRoomWindow().render().$el);
		},

		remove: function(room) {
			this.collection.remove(room.model);
			delete room;
			this.render();
		}
	});

	return LocaleChatroomListView;
});