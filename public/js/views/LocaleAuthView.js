define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleAuth'
], function($, _, Backbone, Bootstrap, LocaleAuth){

	var LocaleAuthView = Backbone.View.extend({
		el: '#loginpage',

		events: {
			'click #facebook' : 'loginFB',
			'click #google-plus' : 'loginGoogle'
		},

		initialize: function() {
			this.render();
		},

		render: function() {

		},

		loginFB: function() {
			LocaleAuth.LoginFacebook();
		},

		loginGoogle: function() {
			LocaleAuth.LoginGooglePlus();
		},

		logout: function() {
			LocaleAuth.Logout();
		},

		loggedin: function() {
			this.$el.css("z-index", -5);
		}
	});

	return LocaleAuthView;
});