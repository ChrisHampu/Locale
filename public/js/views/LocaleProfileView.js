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
			'click #add-locale' : 'createLocale',
			'click .toggle-delete' : 'toggle'
		},

		initialize: function() {
			$('#profile-thumbnail').sidr();
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

		createLocale: function () {
			//event.preventDefault();
			var name = this.$el.find("#roomName").val();
			var description = this.$el.find("#roomDescription").val();

			if(name === undefined || description === "")
				return;

			var roomData = {
				"name": name,
				"description": description
			}

			console.log("Adding " + name);
			
			LocaleSocket.Emit('addroom', roomData);
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
				$('.profilepic').css("background", "url(" + url + ")").css("background-size", "contain");

				var first = LocaleAuth.GetUserModel().get("firstName");
				var last = LocaleAuth.GetUserModel().get("lastName");

				$('#profile-content-sidr').html(first + " " + last);
			}, 100);
		}
	});

	return LocaleProfileView;
});