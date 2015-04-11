define([
	'jquery',
	'thorax',
	'bootstrapjs',
	'LocaleChatUserModel',
	'LocaleChatroomCollection',
	'LocaleChatWindowView',
	'LocaleChatMessageModel',
	'LocaleSocket',
	'hbs!templates/LocaleButton'
], function($, Thorax, Bootstrap, LocaleChatUserModel, LocaleChatroomCollection, LocaleChatWindowView, LocaleChatMessageModel, LocaleSocket, ButtonTemplate){

	var LocaleChatroomView = Thorax.View.extend({
		name: "ChatroomView",

		events: {
			'click .room-button' : 'join',
			'keypress .exit-room' : 'remove',
			'click .delete-locale' : 'deleteLocale',
			'click .update-locale' : 'updateLocale',
			'click .toggle-pencil' : 'expandUpdate'
		},

		initialize: function() {

		},

		template: ButtonTemplate,

		// Allows to transform attributes before being sent to the template for rendering
		context: function() {
			var atts = this.model.attributes;
			if(atts.tags instanceof Array)
				atts.tags = "#" + this.model.attributes.tags.join(" #");
			return atts;
		},

		deleteLocale: function() {

			// TODO: Confirmation window. Very easy to accidently delete a locale

			//this.parent.deleteRoom(this);
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

		resetMessages: function() {
			//this.ChatMessages.reset();
			//this.ChatWindow.renderAllMessages(); // This basically just forces the view to remove all messages
		},

		updateUsers: function(users) {
			this.$el.find(".badge").html(users.length);
			this.model.set("userCount", users.length);
			this.model.set("users", users);
		},

		join: function() {
			this.model.set("joined", true);
			LocaleSocket.Emit('joinroom', this.model.get("name"));
		},

		expandUpdate: function(e){
			if($(e.currentTarget).parent().parent().children(".edit-locale").css("height") == "330px"){
				$(e.currentTarget).parent().parent().children(".edit-locale").stop().animate({height: "0px"}, function(){
					$(e.currentTarget).parent().parent().children(".edit-locale").css("display","none");
				});
			} else {
				$(e.currentTarget).parent().parent().children(".edit-locale").css("display","block");
				$(e.currentTarget).parent().parent().children(".edit-locale").stop().animate({height: "330px"}, function(){
				});
			}
			
		}
			
	});

	return LocaleChatroomView;
});