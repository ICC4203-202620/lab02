
const restaurants = [
  {
    id: 'restaurant-1',
    name: 'Restaurant Valle Hermoso',
    latitude: -33.42897,
    longitude: -70.72752
  },
  {
    id: 'restaurant-2',
    name: 'El Quitapenas',
    latitude: -33.41415,
    longitude: -70.64343
  },
  {
    id: 'restaurant-3',
    name: 'Club de la Unión',
    latitude: -33.44338,
    longitude: -70.65143
  },
  {
    id: 'restaurant-4',
    name: 'Del Beto',
    latitude: -33.48295,
    longitude: -70.65023
  },
  {
    id: 'restaurant-5',
    name: 'Chilenazo La Florida',
    latitude: -33.53667,
    longitude: -70.59306
  },
  {
    id: 'restaurant-6',
    name: 'La Vaquita Echá',
    latitude: -33.62357,
    longitude: -70.54065
  },
  {
    id: 'restaurant-7',
    name: 'Las Lanzas',
    latitude: -33.45554,
    longitude: -70.59427
  },
  {
    id: 'restaurant-8',
    name: 'Fuente Alemana',
    latitude: -33.42538,
    longitude: -70.61144
  },
  {
    id: 'restaurant-9',
    name: 'Boragó',
    latitude: -33.38273,
    longitude: -70.58404
  },
  {
    id: 'restaurant-10',
    name: 'Doña Tina',
    latitude: -33.36105,
    longitude: -70.49206
  }
];

const metroStations = [
  {
    id: 'metro-station-1',
    name: 'San Pablo',
    latitude: -33.4453083,
    longitude: -70.7231389
  },
  {
    id: 'metro-station-2',
    name: 'Los Héroes',
    latitude: -33.4461694,
    longitude: -70.6604417
  },
  {
    id: 'metro-station-3',
    name: 'Puente Cal y Canto',
    latitude: -33.4331111,
    longitude: -70.6518056
  },
  {
    id: 'metro-station-4',
    name: 'Universidad de Chile',
    latitude: -33.44375,
    longitude: -70.6503444
  },
  {
    id: 'metro-station-5',
    name: 'Baquedano',
    latitude: -33.4375,
    longitude: -70.635
  },
  {
    id: 'metro-station-6',
    name: 'Tobalaba',
    latitude: -33.41806,
    longitude: -70.60167
  },
  {
    id: 'metro-station-7',
    name: 'Ñuñoa',
    latitude: -33.4541667,
    longitude: -70.6049722
  },
  {
    id: 'metro-station-8',
    name: 'Plaza Egaña',
    latitude: -33.4533889,
    longitude: -70.5708056
  },
  {
    id: 'metro-station-9',
    name: 'La Cisterna',
    latitude: -33.5373889,
    longitude: -70.6643889
  },
  {
    id: 'metro-station-10',
    name: 'Vicente Valdés',
    latitude: -33.5265,
    longitude: -70.5968056
  }
];

const restaurantSelect = document.querySelector('#restaurant-select');
const restaurantCoordinates = document.querySelector('#restaurant-coordinates');
const originsSection = document.querySelector('#origins-section');
const stationSelect = document.querySelector('#station-select');
const stationCoordinates = document.querySelector('#station-coordinates');
const calculateStationButton = document.querySelector('#calculate-station');
const locationSection = document.querySelector('#location-section');
const locationOutput = document.querySelector('#location-output');
const requestLocationButton = document.querySelector('#request-location');
const calculateLocationButton = document.querySelector('#calculate-location');
const distanceSection = document.querySelector('#distance-section');
const distanceResult = document.querySelector('#distance-result');

function populateSelect(select, places) {
  for (const place of places) {
    const option = document.createElement('option');
    option.value = place.id;
    option.textContent = place.name;
    select.append(option);
  }
}

function findPlace(places, id) {
  return places.find((place) => place.id === id) ?? null;
}

function getSelectedRestaurant() {
  return findPlace(restaurants, restaurantSelect.value);
}

function getSelectedStation() {
  return findPlace(metroStations, stationSelect.value);
}

function formatCoordinates(place) {
  return `Latitud: ${place.latitude.toFixed(6)}; longitud: ${place.longitude.toFixed(6)}`;
}

// Calcula la distancia geodésica aproximada entre dos coordenadas mediante la
// fórmula de Haversine. El resultado se expresa en kilómetros.
function calculateDistanceKm(origin, destination) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const latitudeDifference = toRadians(destination.latitude - origin.latitude);
  const longitudeDifference = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return earthRadiusKm * centralAngle;
}

function formatDistance(distanceKm) {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(distanceKm);
}

restaurantSelect.addEventListener('change', () => {
  const restaurant = getSelectedRestaurant();

  stationSelect.value = '';
  stationCoordinates.textContent = '';
  stationCoordinates.hidden = true;
  calculateStationButton.disabled = true;
  calculateStationButton.hidden = true;
  distanceResult.textContent = '';
  distanceSection.hidden = true;

  if (!restaurant) {
    restaurantCoordinates.textContent = '';
    restaurantCoordinates.hidden = true;
    originsSection.hidden = true;
    return;
  }

  restaurantCoordinates.textContent = formatCoordinates(restaurant);
  restaurantCoordinates.hidden = false;
  originsSection.hidden = false;
});

stationSelect.addEventListener('change', () => {
  const station = getSelectedStation();

  if (!station) {
    stationCoordinates.textContent = '';
    stationCoordinates.hidden = true;
    calculateStationButton.disabled = true;
    calculateStationButton.hidden = true;
    distanceResult.textContent = '';
    distanceSection.hidden = true;
    return;
  }

  stationCoordinates.textContent = formatCoordinates(station);
  stationCoordinates.hidden = false;
  calculateStationButton.disabled = false;
  calculateStationButton.hidden = false;
  distanceResult.textContent = '';
  distanceSection.hidden = true;
});

calculateStationButton.addEventListener('click', () => {
  const restaurant = getSelectedRestaurant();
  const station = getSelectedStation();

  if (!restaurant || !station) {
    return;
  }

  const distanceKm = calculateDistanceKm(station, restaurant);
  distanceResult.textContent =
    `La estación de Metro "${station.name}" se encuentra a ${formatDistance(distanceKm)} km en línea recta del restaurante "${restaurant.name}"`;
  distanceSection.hidden = false;
});

populateSelect(restaurantSelect, restaurants);
populateSelect(stationSelect, metroStations);

async function initializeLocation() {
  // Actividad 6 - Detectar la capacidad y mostrar la interfaz
  // La sección de ubicación ya existe en index.html, pero tiene el atributo
  // hidden. Reemplazar false por una comprobación de navigator.geolocation.

  // TODO: Actividad 6
  const geolocationAvailable = false;

  // Si la capacidad no existe, el script finaliza sin modificar el HTML. La
  // alternativa de calcular desde una estación continúa disponible.
  if (!geolocationAvailable) {
    return;
  }

  // Si la capacidad existe, sólo es necesario mostrar la interfaz preparada.
  locationSection.hidden = false;

  // Actividad 7 - Consultar y representar el estado del permiso
  // - 7.1 Declarar las variables de estado y definir
  //       updatePermissionInterface(state).
  // - 7.2 Establecer prompt como estado inicial.
  // - 7.3 Consultar navigator.permissions con await, si la API está disponible,
  //       y escuchar el evento change del objeto PermissionStatus.

  let permissionState = 'prompt';
  let currentLocation = null;

  function updatePermissionInterface(state) {
    permissionState = state;

    const messages = {
      prompt: 'Aún no se ha solicitado acceso a la ubicación.',
      granted: 'El permiso fue concedido. Puede solicitar su ubicación.',
      denied: 'El permiso fue rechazado. Debe restablecerse desde la configuración del sitio.'
    };

    // Ejemplo: seleccionar un valor utilizando el estado como clave.
    locationOutput.textContent = messages[state];

    if (state === 'granted') {
      requestLocationButton.textContent = 'Obtener ubicación';
    } else {
      // TODO: Actividad 7.1 - Mostrar "Solicitar acceso" para los demás
      // estados.
    }

    // TODO: Actividad 7.1 - Deshabilitar el botón únicamente cuando state sea
    // "denied".

    if (state !== 'granted') {
      currentLocation = null;

      // Ejemplo: impedir el cálculo cuando no existe acceso.
      calculateLocationButton.disabled = true;

      // TODO: Actividad 7.1 - Ocultar el mismo botón.
    }
  }

  // TODO: Actividad 7.2 - Establecer prompt como estado inicial

  if ('permissions' in navigator) {
    try {
      const permissionStatus = await navigator.permissions.query({
        name: 'geolocation'
      });

      // Ejemplo: representar el resultado de la consulta inicial.
      updatePermissionInterface(permissionStatus.state);

      permissionStatus.addEventListener('change', () => {
        // TODO: Actividad 7.3 - Repetir la actualización anterior utilizando
        // el nuevo estado de permissionStatus.
      });
    } catch {
      // TODO: Actividad 7.3 - Restablecer la interfaz al estado "prompt".
    }
  }

  // Actividad 8 - Solicitar acceso y obtener la ubicación
  // - 8.1 Registrar el listener de requestLocationButton y determinar el
  //       propósito de la pulsación.
  // - 8.2 Resolver una lectura exitosa y, cuando corresponda, almacenar y
  //       presentar las coordenadas.
  // - 8.3 Resolver el rechazo del permiso y los demás errores.

  requestLocationButton.addEventListener('click', () => {
    const obtainingLocation = permissionState === 'granted';

    requestLocationButton.disabled = true;

    if (obtainingLocation) {
      locationOutput.textContent = 'Obteniendo la ubicación…';
    } else {
      // TODO: Actividad 8.1 - Informar que se espera la respuesta del usuario.
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!obtainingLocation) {
          // Esta pulsación sólo se utilizó para solicitar el permiso.
          updatePermissionInterface('granted');
          return;
        }

        currentLocation = {};

        // Ejemplo: copiar la latitud recibida al objeto de la aplicación.
        currentLocation.latitude = position.coords.latitude;

        // TODO: Actividad 8.2 - Copiar la longitud siguiendo el ejemplo de la
        // latitud.

        locationOutput.textContent = formatCoordinates(currentLocation);

        // Ejemplo: habilitar el cálculo después de obtener las coordenadas.
        calculateLocationButton.disabled = false;

        // TODO: Actividad 8.2 - Mostrar el mismo botón.

        requestLocationButton.disabled = false;
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          updatePermissionInterface('denied');
          return;
        }

        locationOutput.textContent =
          `No fue posible obtener la ubicación: ${error.message}`;
        requestLocationButton.disabled = false;
      }
    );
  });

  // Actividad 9 - Calcular desde la ubicación actual
  // Agregar aquí el listener de calculateLocationButton. Utilizar las
  // coordenadas obtenidas en la actividad 8 y escribir la distancia en
  // distanceResult mediante calculateDistanceKm(origin, restaurant). Mostrar
  // distanceSection sólo después de presionar el botón.

  calculateLocationButton.addEventListener('click', () => {
    // Utilizar el listener de calculateStationButton como ejemplo para:
    // TODO: obtener y validar el restaurante y currentLocation;
    // TODO: calcular y formatear la distancia;
    // TODO: escribir el resultado y mostrar distanceSection.
  });
}

initializeLocation();
