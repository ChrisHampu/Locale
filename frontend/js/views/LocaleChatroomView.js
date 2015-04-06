define([
	'jquery',
	'thorax',
	'bootstrapjs',
	'LocaleChatUserModel',
	'LocaleChatWindowView',
	'LocaleChatroomMessageCollection',
	'LocaleChatMessageModel',
	'LocaleSocket',
	'hbs!templates/LocaleButton'
], function($, Thorax, Bootstrap, LocaleChatUserModel, LocaleChatWindowView, LocaleChatroomMessageCollection, LocaleChatMessageModel, LocaleSocket, ButtonTemplate){

	var LocaleChatroomView = Thorax.View.extend({
		tagName: 'li',

		events: {
			'click .room-button' : 'join',
			'keypress .exit-room' : 'remove',
			'click .delete-locale' : 'deleteLocale',
			'click .update-locale' : 'updateLocale'
		},

		initialize: function(options) {
			this.parent = options.parent;
			//this.listenTo(this.model, "change", this.render);

			this.ChatMessages = new LocaleChatroomMessageCollection();
			this.ChatWindow = new LocaleChatWindowView( { collection: this.ChatMessages, parent: this, UserModel: this.model });
		},

		template: ButtonTemplate,

		// Allows to transform attributes before being sent to the template for rendering
		context: function() {
			var atts = this.model.attributes;
			if(atts.tags instanceof Array)
				atts.tags = "#" + this.model.attributes.tags.join(" #");
			return atts;
		},

		renderButton: function() {

			this.render();

			return this;
		},

		deleteLocale: function() {

			// TODO: Confirmation window. Very easy to accidently delete a locale

			this.parent.deleteRoom(this);
			LocaleSocket.Emit('deletelocale', this.model.get("name"));
			LocaleSocket.Emit('updaterooms');
		},

		updateLocale: function() {

			var newName = this.$el.find("#roomName").val();
			var newDesc = this.$el.find("#roomDescription").val();
			var newTags = this.$el.find("#roomTags").val().split(" ").join("");
			newTags = newTags.split("#");
			newTags.splice(0,1);

			var newPriv = this.$el.find('button.btn-locale-privacy.active').data("privacy");

			LocaleSocket.Emit('updateroom', { "updateRoom": this.model.get("name"), "name": newName, "description": newDesc, "tags": newTags, "privacy": newPriv} );

			var editLocale = this.$el.find(".edit-locale");

			editLocale.animate({height: "0px"}, function(){
				editLocale.css("display","none");
			});
		},

		getRoomWindow: function() {
			
			return this.ChatWindow;
		},

		// Deprecated
		removeChatWindow: function() {
			this.ChatWindow.$el.css("display: none");
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