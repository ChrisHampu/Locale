define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrapjs',
	'sidr',
	'LocaleAuth',
	'LocaleSocket'
], function($, _, Backbone, Bootstrap, sidr, LocaleAuth, LocaleSocket){

	var sidrOpened = false;
	var LocaleProfileView = Backbone.View.extend({
		el: '#menubar',

		events: {
			'click #profile-thumbnail' : 'profile',
			'click .toggle-delete' : 'toggle'
		},

		initialize: function() {
			$('#profile-thumbnail').sidr();

			this.$el.on('click', "#form-dialog-btn", function() {

				var displayed = $("#add-room-dialog").css("display");

				if(displayed === "block"){
					$("#add-room-dialog").stop().animate({height: "0"}, function(){
						$("#add-room-dialog").css("display", "none");
					})
				}else{
					$("#add-room-dialog").css("display", "block");
					$("#add-room-dialog").stop().animate({height: "250px"});
				}

			});
		},

		render: function() {
			LocaleAuth.FinalizeData();
		},

		profile: function() {
			sidrOpened ? sidrOpened = false : sidrOpened = true;
			if(sidrOpened){
				$('#search-bar-wrapper').stop().animate({ left: "-90px"});
			} else {
				$('#search-bar-wrapper').stop().animate({ left: "0px"});
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
		},

		setProfilePic: function(url) {
			setTimeout(function() {
				$('.profilepic').css("background", "url(" + url + ")");

				var first = LocaleAuth.GetUserModel().get("firstName");
				var last = LocaleAuth.GetUserModel().get("lastName");

				$('#profile-content-sidr').children('h1'). html(first + " " + last);
				$('#profile-content-sidr').children('p'). html('Something interesting should probably go here');
			}, 100);
		}
	});

	return LocaleProfileView;
});