define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleChatroomView'
], function($, _, Backbone, Bootstrap, LocaleChatroomView){

	var LocaleChatroomListView = Backbone.View.extend({
		el: '#room-container',

		events: {
		},

		initialize: function() {
			this.render();
		},

		render: function() {

		}
	});

	return LocaleChatroomListView;
});