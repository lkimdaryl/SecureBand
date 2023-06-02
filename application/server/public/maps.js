// variables
const add_member = document.querySelector("#add_member_bttn");
const rescue_mode1 = document.querySelector("#rescue_mode_bttn1");
var computed_color = getComputedStyle(rescue_mode1).backgroundColor;
// const rescue_mode2 = document.querySelector("#rescue_mode_bttn2");
let map;

document.addEventListener("DOMContentLoaded", function () {
  // fetching and posting coordinates  
  fetch_coordinates('/location', 'GET');
  // post_coordinates('/location', 'POST', {});

  // fetch coordinates every 60 seconds 
  var intervial_id = setInterval(fetch_coordinates, 15000);

  // event listener for adding a member
  add_member.addEventListener("click", async function () {
    console.log("add member");
    // adding one child FIX FOR MULTIPLE
    add_child(2);
  })

  // event listener for going into rescue mode for first child
  rescue_mode1.addEventListener("click", async function () {
    // button clicked
    // console.log("rescue_mode1");

    // change the color of the button when clicked
    rescue_mode1.classList.toggle('clicked');

    // check the color of the button to red
    computed_color = getComputedStyle(rescue_mode1).backgroundColor;
    // console.log(computed_color);

    // Check if the color is red
    if (computed_color === 'rgb(255, 0, 0)' || computed_color === 'red') {
      rescue_coordinates('/rescue', 'GET');

      // clearing previous interval 
      clearInterval(intervial_id);

      // fetch coordinates every 3 seconds in rescue mode
      intervial_id = setInterval(rescue_coordinates, 3000);

      // post_coordinates('/location', 'POST', {});

      // console.log("color is", computed_color);
    }

    else {
      // clearing previous interval 
      clearInterval(intervial_id);

      fetch_coordinates('/location', 'GET');

      // fetch coordinates every 60 seconds 
      intervial_id = setInterval(fetch_coordinates, 15000);

      // post_coordinates('/location', 'POST', {});
    }
  });
  // console.log("map loaded!");
});

// ----------------------------------------- DISPLAYING MAP -----------------------------------------
async function initMap(latitude, longitude) {
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

<<<<<<< Updated upstream
// MODIFY for when decision is made on message protocol
const latitude = 40.689247; 
const longitude = -74.044502;
initMap(latitude,longitude);
=======
// ----------------------------------------- FETCHING COORDINATES OF CHILD -----------------------------------------
async function fetch_coordinates() {
  try {
    const response = await fetch('/location', {
      credentials: "same-origin",
      method: 'GET',
      headers: { "Content-Type": "application/json" },
    });

    const { latitude, longitude } = await response.json();

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    // call to display the coordinates on the map
    initMap(latitude, longitude);

  } catch (error) {
    console.error('Error:', error);
  }
}

async function rescue_coordinates() {
  try {
    const response = await fetch('/rescue', {
      credentials: "same-origin",
      method: 'GET',
      headers: { "Content-Type": "application/json" },
    });

    const { latitude, longitude } = await response.json();

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    // call to display the coordinates on the map
    initMap(latitude, longitude);

  } catch (error) {
    console.error('Error:', error);
  }
}

// ----------------------------------------- POSTING COORDINATES OF CHILD -----------------------------------------
// function post_coordinates(url, verb, data = {}, callback) {
//   let body = null;
//   if (Object.keys(data).length > 0) {
//     body = JSON.stringify(data);
//   }

//   return fetch(url, {
//     credentials: 'same-origin',
//     method: verb,
//     body: body,
//     headers: { 'Content-Type': 'application/json' }
//   })
//     .then(response => response.json())
//     .then(response => {
//       console.log("response:", response);
//       if (callback)
//         callback(response);
//     })
//     .catch(error => console.error('Error:', error));
// }

// ----------------------------------------- ADDING CHILDREN -----------------------------------------
function add_child(id) {
  // Create the child profile div
  const child_div = document.createElement("div");
  child_div.classList.add("kids_profile");

  // Create the child image element
  const image = document.createElement("img");
  image.src = "#";
  child_div.appendChild(image);

  // Create the child name paragraph
  const name = document.createElement("p");
  name.textContent = "kid #" + id;
  child_div.appendChild(name);

  // Create the rescue mode button
  const rescue_button = document.createElement("button");
  rescue_button.textContent = "Rescue Mode";
  rescue_button.id = "rescue_mode_bttn" + id;
  child_div.appendChild(rescue_button);

  // Append the child profile to the parent section
  const kids_section = document.getElementById("kids");
  kids_section.appendChild(child_div);

  // Add event listener to the rescue mode button
  rescue_button.addEventListener("click", function() {
    console.log("Rescue button kid " + id);
    // Add your rescue mode logic here
  });
}
>>>>>>> Stashed changes
