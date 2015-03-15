define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleChatUserModel',
	'LocaleChatWindowView',
	'LocaleChatroomMessageCollection',
	'LocaleChatMessageModel',
	'LocaleSocket'
], function($, _, Backbone, Bootstrap, LocaleChatUserModel, LocaleChatWindowView, LocaleChatroomMessageCollection, LocaleChatMessageModel, LocaleSocket){

	var LocaleChatroomView = Backbone.View.extend({
		tagName: 'li',

		events: {
			'click .room-button' : 'join',
			'keypress .exit-room' : 'remove'
		},

		initialize: function(options) {
			this.parent = options.parent;
			//this.listenTo(this.model, "change", this.render);

			this.ChatMessages = new LocaleChatroomMessageCollection();
			this.ChatWindow = new LocaleChatWindowView( { collection: this.ChatMessages, parent: this, UserModel: this.model });
		},

		render: function() {
			this.renderButton();
			this.getRoomWindow().render();
		},

		renderButton: function() {
			this.$el.html('<ul id="my-room-container">' +
                                '<li class="btn-group">'+
                                   '<div class="btn btn-default room-button">' +
                                        '<div class="chatbox-icon"></div>' +
                                        '<div class="chatbox-title">' +
                                            '<div class="h1">' + this.model.get("name") + '</div>' +
                                            '<div class="h2">University of British Columbia</div>' +
                                        '</div>' +
                                        '<span class="badge">' + this.model.get("messageCount") + '</span>' +
                                    '</div>' +
                                      '<div class="btn btn-default">' +
                                        '<i class="fa fa-wrench fa-lg"></i>' +
                                      '</div>' +
                                '</li>');

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
                   // this.remove(this);
                    var numRooms = $('#my-room-container').children().size();
                    if(numRooms == 0){
                            $('#my-room-container').html('<div id="no-rooms">You do not have any rooms!</div>');
                            $('.toggle-delete').css("display", "none");
                    }
                    var maxHeight = (5-numRooms) * 7 + 40 + "%";

                    $('#all-room-container').css("max-height", maxHeight);
            });
			

			this.parent.remove(this);
		},

		addMessage: function(newMessage) {
			//console.log("trying message: " + newMessage);

			this.ChatMessages.add( new LocaleChatMessageModel( { firstName: newMessage.firstName, lastInitial: newMessage.lastInitial, profileUrl: newMessage.profileUrl, message: newMessage.message, timestamp: newMessage.timestamp, room: newMessage.room } ) );
		},

		join: function() {
			this.model.set("joined", true);
			this.parent.render();
			this.ChatMessages.reset();
			LocaleSocket.Emit('joinroom', this.model.get("name"));

			var checkState = this.ChatWindow.$el.css("bottom");
			if (checkState == "42px"){
				this.ChatWindow.$el.children(".chatbox-content").css({display: "block"});
				this.ChatWindow.$el.stop().animate({"bottom" :"384px"}, 400);
			}
		}
	});

	return LocaleChatroomView;
});