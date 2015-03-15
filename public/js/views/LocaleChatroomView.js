define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleChatUserModel',
	'LocaleChatWindowView',
	'LocaleChatroomMessageCollection',
	'LocaleSocket'
], function($, _, Backbone, Bootstrap, LocaleChatUserModel, LocaleChatWindowView, LocaleChatroomMessageCollection, LocaleSocket){

	var LocaleChatroomView = Backbone.View.extend({
		tagName: 'li',

		events: {
			'click .room-button' : 'join',
			'click .exit-room' : 'remove'
		},

		initialize: function(options) {
			this.parent = options.parent;
			this.listenTo(this.model, "change", this.render);

			this.ChatMessages = new LocaleChatroomMessageCollection();
			this.ChatWindow = new LocaleChatWindowView( { collection: this.ChatMessages, parent: this, UserModel: this.model });
		},

		render: function() {
			this.renderButton();
			this.getRoomWindow().render();
		},

		renderButton: function() {
			this.$el.html("<button class=\"btn btn-default room-button\" type=\"submit\">" + this.model.get("name") + "<div class=\"badge\">"+this.model.get("messageCount")+"</div></button><i class=\"fa fa-minus-circle exit-room\"></i>");

			return this;
		},

		getRoomWindow: function() {
			
			return this.ChatWindow;
		},

		removeChatWindow: function() {
			this.ChatWindow.$el.css("display: none");
		},

		remove: function() {
			//this.stop().animate({left:"-200px"}, 2000);
			this.$el.stop().animate({left:"-300px"}, 750, function(){
				//move under element up
				this.remove(this);
				var numRooms = $('#my-room-container').children().size();
				if(numRooms == 0){
					$('#my-room-container').html('<div id="no-rooms">You do not have any rooms!</div>');
					$('.toggle-delete').css("display", "none");
				}
				var maxHeight = (5-numRooms) * 7 + 40 + "%";

				$('#all-room-container').css("max-height", maxHeight);
			})

			//this.parent.remove(this);
		},

		addMessage: function(newMessage) {
			this.ChatMessages.add( { user: newMessage.user, newMessage: message, timestamp: newMessage.timestamp});
		},

		join: function() {
			this.model.set("joined", true);
			this.parent.render();
			LocaleSocket.Emit('joinroom', this.model.get("name"));
		}
	});

	return LocaleChatroomView;
});