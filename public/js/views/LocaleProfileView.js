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
			'click .toggle-delete' : 'toggle'
		},

		initialize: function() {
			$('#profile-thumbnail').sidr();
		},

		render: function() {
		},

		profile: function() {
			sidrOpened ? sidrOpened = false : sidrOpened = true;
			if(sidrOpened){
				//$('#searchbar').css("left", "-20px")
				$('#search-bar-wrapper').stop().animate({ left: "-90px"});
				/*$('.waypoint-info').stop().animate({ left: "-15px"});*/
			} else {
				//$('#searchbar').css("left", "75px")
				$('#search-bar-wrapper').stop().animate({ left: "0px"});
				/*$('.waypoint-info').stop().animate({ left: "75px"});*/
			}
			var numRooms = $('#my-room-container').children().size();
			var maxHeight = (5-numRooms) * 7 + 40 + "%";


			$('#all-room-container').css("max-height", maxHeight);

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