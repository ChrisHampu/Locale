define([
	'jquery',
	'thorax',
	'bootstrapjs',
	'LocaleChatroomView',
	'LocaleChatWindowView',
	'LocaleSocket',
	'LocaleAuth',
	'hbs!templates/LocaleListView'
], function($, Thorax, Bootstrap, LocaleChatroomView, LocaleChatWindowView, LocaleSocket, LocaleAuth, ListTemplate){

	var LocaleChatroomListView = Thorax.View.extend({
		el: '#my-rooms',

		events: {
			'click #add-locale' : 'createLocale'
		},

		name: "ListView",

		//collection: new LocaleChatroomCollection(),

		//chatWindowCollection: new LocaleChatroomCollection(),

		chatroomView: new LocaleChatroomView(),

		initialize: function() {
			//this.$el.find("#my-room-container").html(""); // Remove dummy data
			//$("#chatarea").html("");
			//this.listenTo(this.collection, "add", this.add);
			//this.listenTo(this.collection, "remove", this.remove);
		//	this. // For the button views
			//this. // For the chat window views

			this.Rooms = [];

			this.$el.on('click', '.btn-locale-privacy', function() {

				if(!$(this).hasClass('active')) {
					$('.btn-locale-privacy').removeClass('active');
					$(this).toggleClass('active');
				}
			});
		},

		template: ListTemplate,

		add: function(room) {
			if(!room.get("canJoin")){
				return; //Too far away, don't add;
			}
			var RoomView = new LocaleChatroomView ( { model: room, parent: this });
			RoomView.render();
			RoomView.delegateEvents();
			this.$el.find("#my-room-container").append(RoomView.$el);

			RoomView.delegateEvents();

			if(room.get("joined") === true) {
				RoomView.getRoomWindow().render();
				$("#chatarea").append(RoomView.getRoomWindow().$el);
			}

			RoomView.getRoomWindow().delegateEvents();

			this.Rooms.push(RoomView);
		},

		remove: function(room) {
			var idx = -1;

			if(room.attributes === undefined)
				return;

			for(var i = 0; i < this.Rooms.length; i++) {

				var oldName = this.Rooms[i].model.get("name");
				var newName = room.attributes.name;

				if(newName === oldName) {
					idx = i;
				}
			};

			if(idx >= 0) {
				this.Rooms[idx].getRoomWindow().remove();
				delete this.Rooms[idx].getRoomWindow();
				this.Rooms[idx].remove();
				delete this.Rooms[idx];

				this.Rooms.splice(idx, 1);
			}
		},

		deleteRoom: function(room) {
			this.Rooms = _.without(this.Rooms, room);
			this.render();
		},

		getRooms: function() {
			return this.Rooms;
		},

		createLocale: function() {

			var privacyMode = this.$el.find('button.btn-locale-privacy.active').data("privacy");

			$("#add-room-dialog").stop().animate({height: "0"}, function(){
				$("#add-room-dialog").css("display", "none");
				$('#form-dialog-btn').removeClass('active');
			})
			
			var name = this.$el.find("#roomName").val();
			var description = this.$el.find("#roomDescription").val();
			var tags = this.$el.find("#roomTags").val().split(" ").join("");
			tags = tags.split("#");
			tags.splice(0,1);

			var range = Math.min(Math.max(this.$el.find("#roomRange").val(), 100), 2000);

			if(name === undefined || description === "")
				return;

			if(tags.length == 0){
				LocaleSocket.Emit('addroom', {
					"name": name,
					"description" : description,
					"privacy": privacyMode,
					"tags": [],
					"range": range
				});
			} else {
				LocaleSocket.Emit('addroom', {
					"name": name,
					"description" : description,
					"tags" : tags,
					"privacy": privacyMode,
					"range": range
				});
			}

			this.$el.find("#roomName").val("");
			this.$el.find("#roomDescription").val("");
		}
	});

	return LocaleChatroomListView;
});