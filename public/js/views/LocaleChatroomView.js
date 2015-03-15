define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleChatUserModel'
], function($, _, Backbone, Bootstrap){

	var LocaleChatroomView = Backbone.View.extend({
		tagName: 'li',

		events: {
			'click .exit-room' : 'remove'
		},

		initialize: function(options) {
			this.parent = options.parent;
			this.listenTo(this.model, "change", this.render);
		},

		render: function() {
			this.renderButton();
			this.renderRoom();
		},

		renderButton: function() {
			this.$el.html("<button class=\"btn btn-default room-button\" type=\"submit\">" + this.model.get("name") + "</button><i class=\"fa fa-minus-circle exit-room\"></i>");

			return this;
		},

		renderRoom: function() {
			this.$el.html("");
			
			return this;
		},

		remove: function() {
			this.parent.remove(this);
		}
	});

	return LocaleChatroomView;
});