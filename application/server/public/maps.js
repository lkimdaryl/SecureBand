// initialize and add the map
let map;

async function initMap(latitude,longitude) {
  // location of child
  const position = { lat: latitude, lng: longitude };

  // request needed libraries.
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // map centered at the child
  map = new Map(document.getElementById("map"), {
    zoom: 18,
    center: position,
    mapId: "CHILD_LOCATION",
  });

  // marker positioned at the child
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "child_location",
  });
}

// MODIFY for when decision is made on message protocol
const latitude = 40.689247; 
const longitude = -74.044502;
initMap(latitude,longitude);