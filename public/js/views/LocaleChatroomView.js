define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleChatUserModel',
	'LocaleChatWindowView',
	'LocaleChatroomMessageCollection'
], function($, _, Backbone, Bootstrap, LocaleChatUserModel, LocaleChatWindowView, LocaleChatroomMessageCollection){

	var LocaleChatroomView = Backbone.View.extend({
		tagName: 'li',

		events: {
			'click .exit-room' : 'remove'
		},

		initialize: function(options) {
			this.parent = options.parent;
			this.listenTo(this.model, "change", this.render);

			this.ChatMessages = new LocaleChatroomMessageCollection();
			this.ChatWindow = new LocaleChatWindowView( { collection: this.ChatMessages });
		},

		render: function() {
			this.renderButton();
			this.renderRoom();
		},

		renderButton: function() {
			this.$el.html("<button class=\"btn btn-default room-button\" type=\"submit\">" + this.model.get("name") + "</button><i class=\"fa fa-minus-circle exit-room\"></i>");

			return this;
		},

		getRoomWindow: function() {
			
			return this.ChatWindow;
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

			
		}
	});

	return LocaleChatroomView;
});