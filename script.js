let mymap;
let marker, user_marker, marker_lat, marker_long, user_lat, user_long;
let circle_1, circle_2, circle_3;
let route;
let active = false;

// Circle radius.
const radius1 = 250, radius2 = 500, radius3 = 1000, radius4 = 2000;


// Red icon for user marker.
var redIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

// Green icon for destination marker.
var greenIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});


// Function that checks the distance between the user and the destination.
function checkCoincidence() {
	let distance = calculateDistance();

	if (distance < radius1) {
		vibrationPattern(3);
	} else if (distance < radius2) {
		vibrationPattern(2);
	} else if (distance < radius2) {
		vibrationPattern(1);
	} else if (distance < radius4) {
		vibrationPattern(0);
	}
}


// Function that calculates the distance between the user and the destination.
function calculateDistance() {
	// Distance calculation between the user and the destination.
	let lat_difference = Math.abs(marker_lat - user_lat) * 100000;
	let long_difference = Math.abs(marker_long - user_long) * 100000;
	let distance = Math.sqrt(Math.pow(lat_difference, 2) + Math.pow(long_difference, 2));

	// Distance update in the information box.
	document.getElementById("info").innerHTML = "You are <b>&nbsp;" + distance.toFixed(0) + "&nbsp;meters</b>&nbsp;from destination";

	return distance;
}


// Function that sets the vibration pattern depending on the distance.
function vibrationPattern(code) {
	let repetitions;

	// Vibrations patterns for the different distances.
	if (code == 0) {
		repetitions = [150, 1000, 150, 1000, 150, 1000, 150, 1000];
	} else if (code == 1) {
		repetitions = [150, 300, 150, 300, 150, 300, 150, 300, 150, 300, 150, 300, 150, 300, 150, 300, 150, 300, 150, 300];
	} else if (code == 2) {
		repetitions = [150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50];
	} else if (code == 3) {
		repetitions = 5000;
	}

	window.navigator.vibrate(repetitions);
}


// Function that draws the different circles around the destination.
function drawCircles() {
	// Old circles removal.
	if (circle_1 || circle_2 || circle_3) {
		mymap.removeLayer(circle_1);
		mymap.removeLayer(circle_2);
		mymap.removeLayer(circle_3);
	}

	// New circles creation.
	circle_3 = L.circle([temp_lat, temp_long], radius3).addTo(mymap);
	circle_2 = L.circle([temp_lat, temp_long], radius2).setStyle({color: 'yellow'}).addTo(mymap);
	circle_1 = L.circle([temp_lat, temp_long], radius1).setStyle({color: 'red'}).addTo(mymap);
}


// Function that sets the destination marker.
function setMarker(e) {
	// We can only modify the marker if the application is not active.
	if (!active) {
		// Latitude and longitude temporary variables.
		temp_lat = e.latlng.lat;
		temp_long = e.latlng.lng;

		// Old marker removal.
		if (marker) {
			mymap.removeLayer(marker);
		}

		// New marker creation.
		marker = L.marker([temp_lat, temp_long], {draggable: 'true', icon: greenIcon});

		marker.on('dragend', function (event) {
			if (!active) {
				var position = marker.getLatLng();
				marker.setLatLng(position, {draggable: 'true'}).bindPopup(position).update();
				temp_lat = position.lat;
				temp_long = position.lng;
				drawCircles();
			}
		});

		// We add the marker to the map and draw the circles.
		mymap.addLayer(marker);
		drawCircles();
	}
}


// Function that is executed when the save button is pressed.
function save() {

	if (marker) {
		// We set the application as active.
		active = true;

		// We set the latitude and longitude variables of the marker.
		marker_lat = temp_lat;
		marker_long = temp_long;

		// We hide the save and cancel buttons and show the modify one.
		document.getElementById("save").style.display = "none";
		document.getElementById("cancel").style.display = "none";
		document.getElementById("modify").style.display = "block";
		document.getElementById("info").innerHTML = "Calculating distance...";

		// We desactivate the drag and drop of the marker temporarily.
		marker.dragging.disable();
	} else {
		alert("Select a location to continue.")
	}
}


// Function that is executed when the cancel button is pressed.
function cancel() {
	// We remove the marker and the circles.
	mymap.removeLayer(marker);
	marker = null;
	temp_lat, temp_long = null;
	mymap.removeLayer(circle_1);
	mymap.removeLayer(circle_2);
	mymap.removeLayer(circle_3);
	
}


// Function that is executed when the modify button is pressed.
function modifyLocation() {
	// We set the application as inactive.
	active = false;

	// We show the save and cancel buttons and hide the modify one.
	document.getElementById("info").innerHTML = "Selecciona tu destino";
	document.getElementById("modify").style.display = "none";
	document.getElementById("save").style.display = "block";
	document.getElementById("cancel").style.display = "block";

	// We activate the drag and drop of the marker.
	marker.dragging.enable();

	// Stop the vibration of the device.
	navigator.vibrate(0);
}


// Function that is executed when the start button is pressed.
function start() {
	// We hide the start button and show the save and cancel ones and the map.
	document.getElementById("start").style.display = "none";
	document.getElementById("instructions").style.display = "none";
	document.getElementById("info").style.display = "flex";
	document.getElementById("map_display").style.display = "block";
	document.getElementById("save").style.display = "block";
	document.getElementById("cancel").style.display = "block";

	// Map creation.
	mymap = L.map('map_display').setView([40.332, -3.756], 12);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		maxZoom: 18
	}).addTo(mymap);

	// We check if the browser supports geolocation.
	if ('geolocation' in navigator) {

		// We set the user marker when the user clicks on the map.
		mymap.on('click', setMarker);
		
		// Buttons actions.
		document.getElementById("cancel").addEventListener("click", cancel);
		document.getElementById("save").addEventListener("click", save);
		document.getElementById("modify").addEventListener("click", modifyLocation);
	
		// We get the user position constantly.
		var watchId = navigator.geolocation.watchPosition((position) => {
	
			if (user_marker) {
				mymap.removeLayer(user_marker);
			}
	
			user_lat = position.coords.latitude;
			user_long = position.coords.longitude;
			user_marker = L.marker([user_lat, user_long], {icon: redIcon}).addTo(mymap);

			// We change the map view to the user position.
			mymap.setView([user_lat, user_long], 13);
	
			// If the application is active, we check the coincidence and calculate the distance.
			if (active) {
				checkCoincidence();
				calculateDistance();
			}
		});
	} else {
		alert("Your browser does not support geolocation.");
	}
}

// Application execution when the start button is pressed.
document.getElementById("start").addEventListener("click", start);
