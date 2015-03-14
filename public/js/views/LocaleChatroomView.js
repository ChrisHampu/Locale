define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleChatUserModel'
], function($, _, Backbone, Bootstrap){

	var LocaleChatroomView = Backbone.View.extend({
		el: '',

		events: {

		},

		initialize: function() {
			this.render();
		},

		render: function() {

		}
	});

	return LocaleChatroomView;
});