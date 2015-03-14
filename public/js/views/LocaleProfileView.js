define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs'
], function($, _, Backbone, Bootstrap){


	var LocaleProfileView = Backbone.View.extend({
		el: '#menubar',

		events: {
			'click #profilepic' : 'profile',
		},

		initialize: function() {

		},

		render: function() {
		},

		profile: function() {
			// get sidebar:
			var sidebar = this.$el.find("#sidebar-div");

			//sidebar.css("", "");

			console.log("clicked profile");
		}
	});

	return LocaleProfileView;
});