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

		},

		initialize: function() {
			this.listenTo(this.model, "change", this.render);
		},

		render: function() {
			this.$el.html("");
			
			return this;
		}
	});

	return LocaleChatroomView;
});