define([
	'jquery',
	'thorax',
	'bootstrapjs',
	'LocaleChatMessageModel',
	'LocaleChatUserModel',
	'LocaleAuth',
	'LocaleSocket'
], function($, Thorax, Bootstrap, LocaleChatMessageModel, LocaleChatUserModel, LocaleAuth, LocaleSocket){

	var Weekdays = new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");

	var FormatTimestamp = function(timestamp) {
		var date = new Date(timestamp);

		var day = Weekdays[date.getDay()];
		var hours = "0" + date.getHours();
		var minutes = "0" + date.getMinutes();
		var seconds = "0" + date.getSeconds();

		var format = day + ", " + hours.substr(hours.length-2) + ':' + minutes.substr(minutes.length-2) + ':' + seconds.substr(seconds.length-2);
		
		return format;
	};

	var LocaleChatWindowView = Thorax.View.extend({
		tagName: 'div',

		className: 'chatbox-container', //Change this to chatbox-container and defuckulate it all.

		events: {
			'click .chatbox-minimize' : 'minimize',
			'click .chatbox-exit' : 'exit',
			'click .chatbox-header' : 'maximize',
			'click .send-message' : 'send',
			'keypress .chatbox-input' : 'sendMessage',
			'click .chatbox-settings' : 'toggleSettings',
			'click .close-settings' : 'toggleSettings'
		},

		initialize: function(options) {
			this.parent = options.parent;
			this.ChatUserModel = options.UserModel;
			this.$el.children(".chatbox").html(""); // Remove dummy data
			this.listenTo(this.collection, "add", this.add);
			this.listenTo(this.collection, "change", this.render);
		},

		render: function() {

			var chatStr = "<div class='chatbox'><div class='chatbox-header'><div class='chatbox-icon'></div><div class='chatbox-title'><div class='h1 room-title'>" + this.ChatUserModel.get("name") + "</div>" +
"<div class='h2'>University of British Columbia</div> </div><div class=\"chatbox-controls\"><div class=\"chatbox-exit btn\" href='#'><i class=\"fa fa-close\"></i></div>" +
"<div class=\"chatbox-minimize btn\" href='#'><i class=\"fa fa-minus\"></i></div></div></div><div class='chatbox-content'>" +
"<div class='chatbox-messages'><div class=\"messages-wrapper\"></div> </div><div class='chatbox-input input-group'><input type=\"text\" class=\"form-control message-box\" placeholder=\"Enter Message\" maxlength=\"200\">" +
"<span class=\"input-group-btn send-message\"><button class=\"btn btn-default\" type=\"button\"><i class='fa fa-paper-plane'></i></button>";
"</span></div></div></div>";

			var settingStr = '<div class="chatbox-settings-window"><div class="chatbox-settings-user-container"></div><div class="chatbox-settings-bottom"></div></div>';
			
			var chatboxIcon = "<i class='fa fa-cog fa-lg chatbox-settings'></i>"

			this.$el.html(chatStr);
			this.$el.append(settingStr);
			this.$el.append(chatboxIcon);

			this.renderUsers(this.ChatUserModel.get("users"));
			this.renderAllMessages();

			return this;
		},

		renderAllMessages: function() {
			this.$el.children(".chatbox").find(".messages-wrapper").html("");

			_.each(this.collection.models, function(model) {
				this.$el.children(".chatbox").find(".messages-wrapper").append( this.renderMessage( model ));
			}, this);
		},

		renderMessage: function(message) {
			var UserSent = false;

			var msgUrl = message.get("profilePicture");
			var localUrl = LocaleAuth.GetUserModel().get("profilePicture");

			if(msgUrl === localUrl)
				UserSent = true;

			if (msgUrl !== undefined) {
				var style = "style=\"background: url(" + msgUrl + ");\""
			} else {
				var style = "";
			}

			var msgStr = UserSent === true ? "<div class=\"chat-message local-message\">" : "<div class=\"chat-message foreign-message\">";
            msgStr += "<a href=\"" + message.get("profileUrl") + "\" target=\"_blank\"><div class=\"profilepic chatpic img-circle\"" + style + "></div></a><div class='message-content-wrapper'><div class='message-content' ><p>" +
                        $('<div/>').text(message.get("message")).html() + "</p><a class=\"message-subtext\" href=\""+ message.get("profileUrl") + "\" target=\"_blank\">" + message.get("firstName") + " " + message.get("lastInitial") +
                         "</a><span class=\"message-subtext\"> - " + FormatTimestamp(message.get("timestamp")) + "</span></div></div></div>";

            return msgStr;
		},

		renderUsers: function(users) {
			var container = this.$el.find(".chatbox-settings-user-container");

			container.html("");

			for(var i = 0; i < users.length; i++)
			{
				var userStr = "<div class=\"chatbox-settings-user\">" +
				"<div class=\"chatbox-settings-user-profile\" style=\"background: url(" + users[i].profilePicture + ");\">" +
				"</div><div class=\"chatbox-settings-user-name\">" + users[i].firstName + " " + users[i].lastInitial + "</div></div>";

				container.append(userStr);
			}
		},

		add: function(message) {
			this.$el.children(".chatbox").find(".messages-wrapper").append( this.renderMessage(message) );
			this.$el.children(".chatbox").find(".messages-wrapper").scrollTop(1000000);
		},

		minimize: function(){
			var checkState = this.$el.children(".chatbox").css("bottom");
			var chatWindow = this.$el.children(".chatbox");
			if (checkState == "42px"){
				this.$el.children(".chatbox-content").css({display: "block"});
				this.$el.stop().animate({"bottom" :"384px"}, 400);
			} else {
				this.$el.stop().animate({"bottom" :"42px"}, 400);
			}
		},

		maximize: function(){
			var checkState = this.$el.css("bottom");
			if (checkState == "42px"){
				this.$el.css({display: "block"});
				this.$el.stop().animate({"bottom" :"384px"}, 400);
			}
		},

		send: function() {
			var input = this.$el.children(".chatbox").find(".message-box").val();
			var room = this.$el.children(".chatbox").find(".room-title").text();

			if(input === undefined || input === "")
				return;

			LocaleSocket.Emit('sendchat', {"room": room, "message": input});

			this.$el.children(".chatbox").find(".message-box").val("");
		},

		exit: function(e){
			var room = this.$el.children(".chatbox").find(".room-title").text();
			var chatWindow = this.$el;
			chatWindow.stop().animate({"bottom" :"0px"}, 400, function(){
				chatWindow.css({display: "none"});
				chatWindow.remove();
			});
			this.parent.model.set("joined", false);
			e.stopPropagation();
			LocaleSocket.Emit('leaveroom', room);
		},

		sendMessage:function(e){
			if(e.which === 13){
				this.send();
			}
		},

		toggleSettings:function(){
			if(this.$el.children(".chatbox-settings-window").css("display") == "none"){
				this.$el.children(".chatbox-settings-window").css("display", "block");
				this.$el.children(".chatbox-settings-window").stop().animate({"width": "300px"}, 500);
			} else {
				var sideWindow = this.$el.children(".chatbox-settings-window");
				this.$el.children(".chatbox-settings-window").stop().animate({"width": "0px"},500, function(){
					sideWindow.css("display", "none");
				});
			}
			
		}
	});

	return LocaleChatWindowView;
});