define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs'
], function($, _, Backbone, Bootstrap){

	var LocaleView = Backbone.View.extend({
		el: '#wrapper',

		initialize: function() {
			this.render();
		},

		render: function() {

		},

		loggedin: function() {
			$el.find("#loginform").css("visibility", "hidden");
		}
	});

	return LocaleView;
});