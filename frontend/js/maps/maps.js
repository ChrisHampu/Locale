var map;

function initialize() {

  var mapOptions = {
    zoom: 13,
    disableDefaultUI: true
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  /*var myLatlng = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);*/

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      var marker = new google.maps.Marker({
	      position: pos,
	      map: map
	  });

	  google.maps.event.addListener(marker, 'mouseover', function() {
	    //display info about the room if it is a room, or if it is you, display your info.
	    console.log("hovered");
	});

	  google.maps.event.addListener(marker, 'mouseout', function() {
	    //remove whatever info was displayed
	    console.log("unhovered");
	});

	  google.maps.event.addListener(marker, 'click', function() {
	   	//Pan to and do hovered
	    map.panTo(marker.getPosition());
	    console.log("clicked");
	});


	var circle = new google.maps.Circle({
		center: pos,
		radius: 2000, //Measured in meters
		fillColor: "#758ff9",
		fillOpacity: 0.5,
		strokeOpacity: 0.0,
		strokeWidth: 0,
		map: map
	});





      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);

