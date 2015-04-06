define([
	'jquery',
	'thorax',
	'bootstrapjs',
	'LocaleChatMessageModel',
	'LocaleChatUserModel',
	'LocaleAuth',
	'LocaleSocket',
	'hbs!templates/LocaleWindow',
	'hbs!templates/LocaleWindowMessage'
], function($, Thorax, Bootstrap, LocaleChatMessageModel, LocaleChatUserModel, LocaleAuth, LocaleSocket, WindowTemplate, MessageTemplate){

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

	var LocaleChatWindowView = Thorax.CollectionView.extend({
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
		},

		template: WindowTemplate,

		itemTemplate: MessageTemplate,

		context: function() {
			var atts = this.ChatUserModel.attributes;
			atts.users = this.parent.model.attributes.users;
			return atts;
		},

		itemContext: function(model, index) {
			var atts = model.attributes;

			var msgUrl = model.get("profilePicture");

			atts.userStyle = LocaleAuth.GetUserModel().get("profilePicture") === msgUrl ?
								"<div class=\"chat-message local-message\">" : "<div class=\"chat-message foreign-message\">";
			atts.msgStyle = msgUrl !== undefined ?
							"style=\"background: url(" + msgUrl + ");\"" : "";

			atts.timestamp = FormatTimestamp(model.get("timestamp"));

			return atts;
		},

		add: function(message) {
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