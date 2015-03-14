define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'sidr'
], function($, _, Backbone, Bootstrap, sidr){


	var LocaleProfileView = Backbone.View.extend({
		el: '#menubar',

		events: {
			'click #profilepic' : 'profile',
		},

		initialize: function() {
			$('#profilepic').sidr();
		},

		render: function() {
		},

		profile: function() {
			// get sidebar:
			/*var sidebar = this.$el.find("#sidebar-div");*/

			//sidebar.css("", "");

			console.log("clicked profile");
		}
	});

	return LocaleProfileView;
});