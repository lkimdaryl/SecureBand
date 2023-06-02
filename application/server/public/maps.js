// variables
const add_member = document.querySelector("#add_member_bttn");
let map;

document.addEventListener("DOMContentLoaded", function () {
  // fetching and posting coordinates
  fetch_coordinates('/location', 'GET');
  // post_coordinates('/location', 'POST', {});

  // fetch coordinates every 60 seconds
  var intervial_id = setInterval(fetch_coordinates, 15000);

  add_member.addEventListener('click', function (event) {
    add_child();
  });
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

// MODIFY for when decision is made on message protocol
const latitude = 40.689247;
const longitude = -74.044502;
initMap(latitude,longitude);
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

// ----------------------------------------- HELPFUL FUNCTIONS -----------------------------------------
const body = document.querySelector("body");

function closeForm() {
    var overlay = document.querySelector('#overlay');
    overlay.remove();
    body.style.overflow = 'auto'; // Restore scrolling
}

function getCookie(name) {
    var cookieArr = document.cookie.split(";");
    for (var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}
// ----------------------------------------- ADDING CHILDREN -----------------------------------------
let childId;
function add_child() {
    var overlay = document.createElement('div');
    overlay.id = 'overlay';

    var form = document.createElement('form');
    form.id = 'member_form';

    var firstNameInput = document.createElement('input');
    firstNameInput.type = 'text';
    firstNameInput.placeholder = 'First Name';
    firstNameInput.name = 'first_name'

    var lastNameInput = document.createElement('input');
    lastNameInput.type = 'text';
    lastNameInput.placeholder = 'Last Name';
    lastNameInput.name = 'last_name'

    var closeButton = document.createElement('button');
    closeButton.id = 'close_button'
    closeButton.textContent = 'X';
    closeButton.addEventListener('click', function () {
      closeForm();
    });

    var submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = 'Submit';

    form.appendChild(closeButton);
    form.appendChild(firstNameInput);
    form.appendChild(lastNameInput);
    form.appendChild(submitButton);

    overlay.appendChild(form);
    body.appendChild(overlay);

    // Prevent scrolling when the form is open
    body.style.overflow = 'hidden';

    // Handle form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Add your code here to handle form submission
        var firstName = firstNameInput.value;
        var lastName = lastNameInput.value;
        var parentId = getCookie("user_id");

        // Create the child profile div
        const child_div = document.createElement("div");
        child_div.classList.add("kids_profile");

        // Create the child image element
        const image = document.createElement("img");
        image.classList.add('profile_pic');
        image.src = "../public/images/blank_profile.png";

        // Create the child name paragraph
        const name = document.createElement("p");
        name.textContent = firstName + ' ' + lastName;
//        const kid_num = document.createElement("p");
//        kid_num.textContent = "kid #" + id;

        // Create the rescue mode button
        const rescue_button = document.createElement("button");
        rescue_button.textContent = "Rescue Mode";
        rescue_button.classList.add('rescue_mode_bttn')
//        rescue_button.id = "rescue_mode_bttn" + id;

        // Append the image and paragraph elements to the new kids_profile div
        child_div.appendChild(image);
        child_div.appendChild(name);
//        child_div.appendChild(kid_num);
        child_div.appendChild(rescue_button);

        // Append the child profile to the parent section
        const kids_section = document.getElementById("kids");
        kids_section.appendChild(child_div);

        // Add event listener to the new kids_profile div for editing
        image.addEventListener("click", function () {
            edit_profile(child_div);
        });

        // Add event listener to the rescue mode button
        rescue_button.addEventListener("click", function() {
//        console.log("Rescue button kid " + id);
        // Add your rescue mode logic here
//            console.log("rescue button clicked")

            rescue_button.classList.toggle('clicked');
            var isClicked = rescue_button.classList.contains('clicked');

            if(isClicked){
                rescue_button.style.backgroundColor = 'red'
            }else{
                rescue_button.style.backgroundColor = 'green'
            }

            // Check if the color is red
            if ( rescue_button.style.backgroundColor === 'red') {
                rescue_coordinates('/rescue', 'GET');

                // clearing previous interval
                clearInterval(intervial_id);

                // fetch coordinates every 3 seconds in rescue mode
                intervial_id = setInterval(rescue_coordinates, 3000);

    //          // post_coordinates('/location', 'POST', {});
            }else{
                // clearing previous interval
                clearInterval(intervial_id);

                fetch_coordinates('/location', 'GET');

                // fetch coordinates every 60 seconds
                intervial_id = setInterval(fetch_coordinates, 15000);
            }
        });

        child_data = {first_name: firstName, last_name: lastName, parent_id: parentId}
        fetch('/create_child', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(child_data)
        })
        .then(response => response.json())
        .then(response => {
            childId = response.child_id;
            console.log(childId);
        });
        closeForm();
    });
}
// ----------------------------------------- EDITING CHILDREN -----------------------------------------
function edit_profile(profile){
    var overlay = document.createElement('div');
    overlay.id = 'overlay';

    var form = document.createElement('form');
    form.id = 'member_form';

    var firstNameInput = document.createElement('input');
    firstNameInput.type = 'text';
    firstNameInput.placeholder = 'First Name';

    var lastNameInput = document.createElement('input');
    lastNameInput.type = 'text';
    lastNameInput.placeholder = 'Last Name';

    var closeButton = document.createElement('button');
    closeButton.id = 'close_button'
    closeButton.textContent = 'X';
    closeButton.addEventListener('click', function () {
      closeForm();
    });

    var submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = 'Submit';

    form.appendChild(closeButton);
    form.appendChild(firstNameInput);
    form.appendChild(lastNameInput);
    form.appendChild(submitButton);

    overlay.appendChild(form);
    body.appendChild(overlay);

    // Prevent scrolling when the form is open
    body.style.overflow = 'hidden';

    // Handle form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        var firstName = firstNameInput.value;
        var lastName = lastNameInput.value;

        var this_kid = document.querySelector('.kids_profile p');
        this_kid.innerHTML = firstName + ' ' + lastName;

        // Send updated data to the server
        var childData = {
            first_name: firstName,
            last_name: lastName,
            child_id: childId
        };

        fetch("/edit_child", {
            credentials: "same-origin",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(childData)
        })
        .then((response) => response.json())
        .then((response) => {
            console.log(response);
        });

        closeForm();
    });
}

console.log("map loaded!");
