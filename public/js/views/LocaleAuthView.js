define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'LocaleAuth'
], function($, _, Backbone, Bootstrap, LocaleAuth){

	var Router;

	var LocaleAuthView = Backbone.View.extend({
		el: '#loginpage',

		events: {
			'click #facebook' : 'loginFB',
			'click #google-plus' : 'loginGoogle'
		},

		initialize: function(router) {
			//this.render();
			Router = router;

			LocaleAuth.Initialize(this);
		},

		render: function() {
			this.$el.css("z-index", 5);
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
			Router.loggedin();
		}
	});

	return LocaleAuthView;
});