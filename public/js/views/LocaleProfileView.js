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
			'click #profile-thumbnail' : 'profile',
			'click .toggle-delete' : 'toggle',
			'click .exit-room' : 'dismiss'
		},

		initialize: function() {
			$('#profile-thumbnail').sidr();
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

		},

		toggle: function(){
			if($('.exit-room').css("display") == "none"){
				$('.exit-room').css("display", "inline");
			} else {
				$('.exit-room').css("display", "none");
			}

		},

		dismiss: function(){
			console.log("clicked a dismiss");
			console.log($(this));
		}
	});

	return LocaleProfileView;
});