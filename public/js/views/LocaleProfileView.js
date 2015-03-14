define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'sidr'
], function($, _, Backbone, Bootstrap, sidr){

	var sidrOpened = false;
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
			sidrOpened ? sidrOpened = false : sidrOpened = true;
			console.log(sidrOpened);
			if(sidrOpened){
				//$('#searchbar').css("left", "-20px")
				$('#searchbar').stop().animate({ left: "-20px"});
			} else {
				//$('#searchbar').css("left", "75px")
				$('#searchbar').stop().animate({ left: "75px"});
			}

		}
	});

	return LocaleProfileView;
});