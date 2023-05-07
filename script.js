let mymap;
let marker, user_marker, marker_lat, marker_long, user_lat, user_long;
let circle_1, circle_2, circle_3;
let route;
let active = false;


// Icono rojo para el marcador del usuario.
var redIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

// Icono verde para el marcador del destino.
var greenIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});


// Función que comprueba la distancia entre el usuario y el destino.
function checkCoincidence() {
	let distance = calculateDistance();

	if (distance < 50) {
		vibrationPattern(3);
	} else if (distance < 150) {
		vibrationPattern(2);
	} else if (distance < 500) {
		vibrationPattern(1);
	} else if (distance < 1000) {
		vibrationPattern(0);
	}
}


// Función que calcula la distancia entre el usuario y el destino.
function calculateDistance() {
	// Cálculo de la distancia entre el usuario y el destino.
	let lat_difference = Math.abs(marker_lat - user_lat) * 100000;
	let long_difference = Math.abs(marker_long - user_long) * 100000;
	let distance = Math.sqrt(Math.pow(lat_difference, 2) + Math.pow(long_difference, 2));

	// Actualización distancia en el cuadro de información.
	document.getElementById("info").innerHTML = "Estás a <b>&nbsp;" + distance.toFixed(0) + "&nbsp;metros</b>&nbsp;de tu destino";

	return distance;
}


// Función que establece el patrón de vibración dependiendo de la distancia.
function vibrationPattern(codigo) {
	let repeticiones;

	// Patrones de repetición de vibración.
	if (codigo == 0) {
		repeticiones = [150, 1000, 150, 1000, 150, 1000, 150, 1000];
	} else if (codigo == 1) {
		repeticiones = [150, 300, 150, 300, 150, 300, 150, 300, 150, 300, 150, 300, 150, 300, 150, 300, 150, 300, 150, 300];
	} else if (codigo == 2) {
		repeticiones = [150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50];
	} else if (codigo == 3) {
		repeticiones = 5000;
	}

	window.navigator.vibrate(repeticiones);
}


// Función que dibuja radios de 500, 150 y 50 metros alrededor del destino.
function drawCircles() {
	// Eliminación de los radios anteriores.
	if (circle_1 || circle_2 || circle_3) {
		mymap.removeLayer(circle_1);
		mymap.removeLayer(circle_2);
		mymap.removeLayer(circle_3);
	}

	// Creación de los nuevos radios.
	circle_3 = L.circle([temp_lat, temp_long], 500).addTo(mymap);
	circle_2 = L.circle([temp_lat, temp_long], 150).setStyle({color: 'yellow'}).addTo(mymap);
	circle_1 = L.circle([temp_lat, temp_long], 50).setStyle({color: 'red'}).addTo(mymap);
}


// Función que establece el marcador del destino.
function setMarker(e) {
	// Sólo podemos modificar el marcador si la aplicación no está activa.
	if (!active) {
		// Variables de latitud y longitud temporal.
		temp_lat = e.latlng.lat;
		temp_long = e.latlng.lng;

		// Eliminación del marcador anterior.
		if (marker) {
			mymap.removeLayer(marker);
		}

		// Creación del nuevo marcador.
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

		// Añadimos el marcador al mapa y dibujamos los radios.
		mymap.addLayer(marker);
		drawCircles();
	}
}


// Función que se ejecuta al pulsar el botón de guardar.
function guardar() {

	if (marker) {
		// Establecemos la aplicación como activa.
		active = true;

		// Establecemos las variables de latitud y longitud del marcador.
		marker_lat = temp_lat;
		marker_long = temp_long;

		// Ocultamos los botones de guardar y cancelar y mostramos el de modificar.
		document.getElementById("guardar").style.display = "none";
		document.getElementById("cancelar").style.display = "none";
		document.getElementById("modificar").style.display = "block";
		document.getElementById("info").innerHTML = "Calculando la distancia...";

		// Desactivamos el drag and drop del marcador temporalmente.
		marker.dragging.disable();
	} else {
		alert("Selecciona una ubicación para continuar.");
	}
}


// Función que se ejecuta al pulsar el botón de cancelar.
function cancelar() {
	// Eliminamos el marcador y los radios.
	mymap.removeLayer(marker);
	marker = null;
	temp_lat, temp_long = null;
	mymap.removeLayer(circle_1);
	mymap.removeLayer(circle_2);
	mymap.removeLayer(circle_3);
	
}


// Función que se ejecuta al pulsar el botón de modificar.
function modifyLocation() {
	// Establecemos la aplicación como inactiva.
	active = false;

	// Mostramos los botones de guardar y cancelar y ocultamos el de modificar.
	document.getElementById("info").innerHTML = "Selecciona tu destino";
	document.getElementById("modificar").style.display = "none";
	document.getElementById("guardar").style.display = "block";
	document.getElementById("cancelar").style.display = "block";

	// Activamos el drag and drop del marcador.
	marker.dragging.enable();

	// Paramos la vibración del dispositivo.
	navigator.vibrate(0);
}


// Función que se ejecuta al pulsar el botón de comenzar.
function comenzar() {
	// Ocultamos el botón de comenzar y mostramos los de guardar y cancelar y el mapa.
	document.getElementById("comenzar").style.display = "none";
	document.getElementById("instrucciones").style.display = "none";
	document.getElementById("info").style.display = "flex";
	document.getElementById("map_display").style.display = "block";
	document.getElementById("guardar").style.display = "block";
	document.getElementById("cancelar").style.display = "block";

	// Creación del mapa.
	mymap = L.map('map_display').setView([40.332, -3.756], 12);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		maxZoom: 18
	}).addTo(mymap);

	// Comprobamos si el navegador soporta geolocalización.
	if ('geolocation' in navigator) {

		// Establecemos el marcador del usuario al pulsar sobre el mapa.
		mymap.on('click', setMarker);
		
		// Acciones de los botones.
		document.getElementById("cancelar").addEventListener("click", cancelar);
		document.getElementById("guardar").addEventListener("click", guardar);
		document.getElementById("modificar").addEventListener("click", modifyLocation);
	
		// Obtenemos la posición del usuario constantemente.
		var watchId = navigator.geolocation.watchPosition((position) => {
	
			if (user_marker) {
				mymap.removeLayer(user_marker);
			}
	
			user_lat = position.coords.latitude;
			user_long = position.coords.longitude;
			user_marker = L.marker([user_lat, user_long], {icon: redIcon}).addTo(mymap);
	
			// Si la aplicación está activa, comprobamos la coincidencia y calculamos la distancia.
			if (active) {
				checkCoincidence();
				calculateDistance();
			}
		});
	} else {
		alert("Tu navegador no soporta geolocalización.");
	}
}

// Ejecución de la aplicación al pulsar el botón de comenzar.
document.getElementById("comenzar").addEventListener("click", comenzar);
