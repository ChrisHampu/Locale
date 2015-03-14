define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs'
], function($, _, Backbone, Bootstrap){

	var LocaleAuthView = Backbone.View.extend({
		el: '#mappage',

		events: {
			'click #do-search' : 'search',
		},

		initialize: function() {
			this.render();
		},

		render: function() {

		},

		search: function() {
			console.log(this.$el.find("search-content").val);
		}
	});

	return LocaleAuthView;
});