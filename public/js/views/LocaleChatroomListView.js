define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleChatroomView',
	'LocaleSocket',
	'LocaleAuth'
], function($, _, Backbone, Bootstrap, LocaleChatroomView, LocaleSocket, LocaleAuth){

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

			$("#add-room-dialog").stop().animate({height: "0"}, function(){
				$("#add-room-dialog").css("display", "none");
				$('#form-dialog-btn').removeClass('active');
			})
			
			var name = this.$el.find("#roomName").val();
			var description = this.$el.find("#roomDescription").val();
			var tags = this.$el.find("#roomTags").val().replace(" ","").split("#");
			tags.splice(0,1);
			console.log(tags);

			if(name === undefined || description === "")
				return;
			if(tags.length == 0){
				LocaleSocket.Emit('addroom', {
					"name": name,
					"description" : description
				});
			} else {
				LocaleSocket.Emit('addroom', {
					"name": name,
					"description" : description,
					"tags" : tags,
					"admin" : LocaleAuth.GetUserModel().get("profileUrl")
				});
			}

			console.log("creating locale named " + name);

			this.$el.find("#roomName").val("");
			this.$el.find("#roomDescription").val("");
		}
	});

	return LocaleChatroomListView;
});