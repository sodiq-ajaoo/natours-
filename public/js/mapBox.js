/* eslint-disable */

// const locations = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(locations);

// const mapBox = document.getElementById('map');

// if (mapBox) {
//   const locations = JSON.parse(mapBox.dataset.locations);

//   const first = locations[0].coordinates;

//   const map = L.map('map').setView([first[1], first[0]], 8);

//   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; OpenStreetMap contributors',
//   }).addTo(map);

//   locations.forEach((loc) => {
//     L.marker([loc.coordinates[1], loc.coordinates[0]])
//       .addTo(map)
//       .bindPopup(`Day ${loc.day}: ${loc.description}`);
//   });
// }

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const mapBox = document.getElementById('map');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  const tourName = mapBox.dataset.tourName;

  const first = locations[0].coordinates;

  const map = L.map('map').setView([first[1], first[0]], 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  locations.forEach((loc) => {
    L.marker([loc.coordinates[1], loc.coordinates[0]]).addTo(map).bindPopup(`
        <strong>${tourName}</strong><br>
        Day ${loc.day}: ${loc.description}
      `);
  });
}
