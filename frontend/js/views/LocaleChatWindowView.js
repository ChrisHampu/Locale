define([
	'jquery',
	'thorax',
	'bootstrapjs',
	'LocaleChatMessageModel',
	'LocaleChatUserModel',
	'LocaleChatroomMessageCollection',
	'LocaleAuth',
	'LocaleSocket',
	'hbs!templates/LocaleWindow',
	'hbs!templates/LocaleWindowMessage'
], function($, Thorax, Bootstrap, LocaleChatMessageModel, LocaleChatUserModel, LocaleChatroomMessageCollection, LocaleAuth, LocaleSocket, WindowTemplate, MessageTemplate){

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

		name: "ChatWindowwView",

		events: {
			'click .chatbox-minimize' : 'minimize',
			'click .chatbox-exit' : 'exit',
			'click .chatbox-header' : 'maximize',
			'click .send-message' : 'send',
			'keypress .chatbox-input' : 'sendMessage',
			'click .chatbox-settings' : 'toggleSettings',
			'click .close-settings' : 'toggleSettings',
			'rendered': 'rendered'
		},

		initialize: function(options) {
			this.collection = new LocaleChatroomMessageCollection();
		},

		template: WindowTemplate,

		itemTemplate: MessageTemplate,

		context: function() {
			var atts = this.model.attributes;
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

		rendered: function() {
			if(this.model.get("joined") === true) {
				if(this.$el.children(".chatbox").css("bottom") != "384px" && this.$el.children(".chatbox").css("bottom") != "42px") {

					this.$el.css({display: "inline-block"});
					this.$el.stop().animate({"bottom" :"384px"}, 400);
				}
				
				if(this.$el.children(".chatbox").css("bottom") == "42px"){
					this.$el.children(".chatbox").stop().animate({"bottom" :"384px"}, 400);
				}
			}
		},

		addMessage: function(newMessage, callback) {
			this.collection.add( new LocaleChatMessageModel( { firstName: newMessage.firstName, lastInitial: newMessage.lastInitial, 
				profilePicture: newMessage.profilePicture, message: newMessage.message, timestamp: newMessage.timestamp, 
				room: newMessage.room, profileUrl: newMessage.profileUrl } ) );

			this.$el.children(".chatbox").find(".messages-wrapper").scrollTop(1000000);

			if(callback !== undefined)
				callback(this.model.get("location"), this.model.get("radius"));
		},

		minimize: function(e){
			var checkState = this.$el.css("bottom");

			if (checkState === "42px")

				this.$el.stop().animate({"bottom" :"384px"}, 400);
			else
				this.$el.stop().animate({"bottom" :"42px"}, 400);

			e.stopPropagation();
		},

		maximize: function(){
			var checkState = this.$el.css("bottom");
			if (checkState === "42px"){
				this.$el.css({display: "inline-block"});
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
			var model = this.model;
			var chatWindow = this.$el;

			chatWindow.stop().animate({"bottom" :"0px"}, 400, function(){

				model.set("joined", false);
				LocaleSocket.Emit('leaveroom', model.get("name"));
			});
		},

		sendMessage:function(e){
			if(e.which === 13)
				this.send();
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