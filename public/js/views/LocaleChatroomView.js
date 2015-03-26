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
			'keypress .exit-room' : 'remove',
			'click .delete-locale' : 'deleteLocale'
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
                                    '<div class="h2">Vancouver, BC</div>' +
                                '</div>' +
                                '<div class="badge">' + this.model.get("userCount") + '</div>' +
                            '</div>' +
                              '<div class="btn btn-default toggle-pencil">' +
                                '<i class="fa fa-pencil fa-lg"></i>' +
                              '</div>' +
                        '</div>' +
                        '<div class="panel panel-default edit-locale">' +
                            '<div class="panel-body">' +
                                '<form>' +
                            	   '<div class="form-group">' +
                                        '<input type="text" class="form-control" id="roomName" placeholder="Locale Name" value="' + this.model.get("name") + '">' +
                                   '</div>' + 
                                   '<div class="form-group">' + 
                                        '<textarea class="form-control" id="roomDescription" placeholder="Locale Description" rows="3">' + this.model.get("description") +'</textarea>' + 
                                   '</div>' + 
                                   '<div class="form-group">' + 
                                        '<input type="text" class="form-control" id="roomTags" placeholder="Tags" value="' + this.model.get("tags") +'">' + 
                                   '</div>' + 
                                   '<div class="form-group">' + 
										'<div class="btn-group" role="group" aria-label="Privacy">' +
											'<button type="button" class="btn btn-default btn-locale-privacy active" data-privacy="public">Public</button>' + 
											'<button type="button" class="btn btn-default btn-locale-privacy" data-privacy="unlisted">Unlisted</button>' + 
											'<button type="button" class="btn btn-default btn-locale-privacy" data-privacy="private">Private</button>' + 
										'</div>' + 
									'</div>' + 
									'<div class="form-group edit-button-container">' + 
										'<button type="button" class="btn btn-success update-locale"><i class="fa fa-check"></i> Update</button>' + 
										'<button type="button" class="btn btn-danger delete-locale"><i class="fa fa-trash-o"></i> Delete</button>' +
									'</div>' + 
                                '</form>' +
                            '</div>' +
                            '</div>' +
                        '</div>' 
            );

			return this;
		},

		deleteLocale: function() {
			this.parent.deleteRoom(this);
			LocaleSocket.Emit('deletelocale', this.model.get("name"));
			LocaleSocket.Emit('updaterooms');
		},

		getRoomWindow: function() {
			
			return this.ChatWindow;
		},

		// Deprecated
		removeChatWindow: function() {
			this.ChatWindow.$el.css("display: none");
		},

		// Deprecated
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

		resetMessages: function() {
			this.ChatMessages.reset();
			this.ChatWindow.renderAllMessages(); // This basically just forces the view to remove all messages
		},

		addMessage: function(newMessage, callback) {
			this.ChatMessages.add( new LocaleChatMessageModel( { firstName: newMessage.firstName, lastInitial: newMessage.lastInitial, 
				profilePicture: newMessage.profilePicture, message: newMessage.message, timestamp: newMessage.timestamp, 
				room: newMessage.room, profileUrl: newMessage.profileUrl } ) );

			if(callback !== undefined)
				callback(this.model.get("location"), this.model.get("radius"));
		},

		updateUsers: function(users) {
			this.$el.find(".badge").html(users.length);
			this.model.set("userCount", users.length);
			this.model.set("users", users);
			this.ChatWindow.renderUsers(users);
		},

		join: function() {
			if(this.ChatWindow.$el.children(".chatbox").css("bottom") != "384px" && this.ChatWindow.$el.children(".chatbox").css("bottom") != "42px"){
				this.model.set("joined", true);
				this.parent.render();
				LocaleSocket.Emit('joinroom', this.model.get("name"));
				this.ChatWindow.$el.css({display: "inline-block"});
				this.ChatWindow.$el.stop().animate({"bottom" :"384px"}, 400);
				
			}
			if(this.ChatWindow.$el.children(".chatbox").css("bottom") == "42px"){
				this.ChatWindow.$el.children(".chatbox").stop().animate({"bottom" :"384px"}, 400);
			}
			/*var checkState = this.ChatWindow.$el.children(".chatbox").css("bottom");
			console.log(this.ChatWindow.$el.children(".chatbox").css("bottom"));*/
		}
	});

	return LocaleChatroomView;
});