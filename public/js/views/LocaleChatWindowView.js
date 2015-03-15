define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleChatMessageModel',
	'LocaleChatUserModel'
], function($, _, Backbone, Bootstrap, LocaleChatMessageModel, LocaleChatUserModel){

	var LocaleChatWindowView = Backbone.View.extend({
		tagName: 'div',

		className: 'chatbox',

		events: {
			'click .chatbox-minimize' : 'minimize',
			'click .chatbox-exit' : 'exit',
			'click .chatbox-header' : 'maximize'

		},

		initialize: function(options) {
			this.parent = options.parent;
			this.ChatUserModel = options.UserModel;
			this.$el.html(""); // Remove dummy data
			this.listenTo(this.collection, "add", this.add);
		},

		render: function() {
			var chatStr = "<div class='chatbox-header'><div class='chatbox-icon'></div><div class='chatbox-title'><div class='h1'>" + this.ChatUserModel.get("name") + "</div>" +
"<div class='h2'>University of British Columbia</div> </div><div class=\"chatbox-controls\"><div class=\"chatbox-exit btn\" href='#'><i class=\"fa fa-close\"></i></div>" +
"<div class=\"chatbox-minimize btn\" href='#'><i class=\"fa fa-minus\"></i></div></div></div><div class='chatbox-content'>" +
"<div class='chatbox-messages'><div class=\"messages-wrapper\"></div> </div><div class='chatbox-input input-group'><input type=\"text\" class=\"form-control message-box\" placeholder=\"Enter Message\">" +
"<span class=\"input-group-btn\"><button class=\"btn btn-default\" type=\"button\"><i class='fa fa-paper-plane'></i></button>";
"</span></div></div>";

			this.$el.html(chatStr);

			return this;
		},

		add: function(message) {

		},

		remove: function(message) {

		},

		minimize: function(){
			var checkState = this.$el.css("bottom");
			if (checkState == "42px"){
				this.$el.children(".chatbox-content").css({display: "block"});
				this.$el.stop().animate({"bottom" :"384px"}, 400);
			} else {
				this.$el.stop().animate({"bottom" :"42px"}, 400, function(){
					this.$el.children(".chatbox-content").css({display: "none"});
				});
			}
		},

		maximize: function(){
			console.log("MAX");
			var checkState = this.$el.css("bottom");
			if (checkState == "42px"){
				this.$el.children(".chatbox-content").css({display: "block"});
				console.log("RUN");
				this.$el.stop().animate({"bottom" :"384px"}, 400);
			}
		},

		exit: function(){
			this.$el.closest(".chatbox").remove();
		}
	});

	return LocaleChatWindowView;
});