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
			this.$el.html(
                        '<div class="btn-group">' +
                           '<div class="btn btn-default room-button">' +
                                '<div class="chatbox-icon"></div>' +
                                '<div class="chatbox-title">' +
                                    '<div class="h1">' + this.model.get("name") + '</div>' +
                                    '<div class="h2">University of British Columbia</div>' +
                                '</div>' +
                                '<span class="badge">' + this.model.get("userCount") + '</span>' +
                            '</div>' +
                              '<div class="btn btn-default toggle-pencil">' +
                                '<i class="fa fa-pencil fa-lg"></i>' +
                              '</div>' +
                        '</div>' +
                        '<div class="panel panel-default edit-locale">' +
                            '<div class="panel-body">' +
                                '<form>' +
                                    '<div class="form-group">' +
                                        '<textarea class="form-control" id="roomDescription" placeholder="Locale Description" rows="3">' +
                                            this.model.get("description") +
                                        '</textarea>' +
                                    '</div>' +
                                    '<div class="form-group">' +
                                        '<textarea class="form-control" id="roomTags" placeholder="Tags" rows="1">' +
                                            this.model.get("tags") +
                                        '</textarea>' +
                                    '</div>' +
                                   
                                    '<button id="delete-locale" type="button" class="btn btn-danger"><i class="fa fa-trash-o"></i> Delete</button>' +
                                    '<button id="update-locale" type="button" class="btn btn-success"><i class="fa fa-check"></i> Update</button>' +
                                '</form>' +
                            '</div>' +
                            '</div>' +
                        '</div>' 
            );

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

		addMessage: function(newMessage, callback) {
			this.ChatMessages.add( new LocaleChatMessageModel( { firstName: newMessage.firstName, lastInitial: newMessage.lastInitial, profileUrl: newMessage.profileUrl, message: newMessage.message, timestamp: newMessage.timestamp, room: newMessage.room } ) );

			if(callback !== undefined)
				callback(this.model.get("location"), this.model.get("radius"));
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