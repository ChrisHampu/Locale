define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleAuth'
], function($, _, Backbone, Bootstrap, LocaleAuth){

	var LocaleAuthView = Backbone.View.extend({
		el: '#loginform',

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
		}
	});

	return LocaleAuthView;
});