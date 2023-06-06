// variables
const add_member = document.querySelector("#add_member_bttn");
let map;
var coordinates_interval;
var posting_interval;
let childId;

document.addEventListener("DOMContentLoaded", function () {
  // display children of user (if any)
  display_children()

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

// ----------------------------------------- FETCHING COORDINATES OF CHILD -----------------------------------------
// hard coded to always read the first child's location bc only one GPS device
async function fetch_coordinates() {
  try {
    const response = await fetch('/location/1', {
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
    const response = await fetch('/rescue/1', {
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
async function post_coordinates(url = '/location', verb = 'POST', data = {}, callback) {
  return fetch(url, {
    credentials: 'same-origin',
    method: verb,
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(response => {
      console.log("response:", response);
      if (callback)
        callback(response);
    })
    .catch(error => console.error('Error:', error));
}

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

    // Create the rescue mode button
    const rescue_button = document.createElement("button");
    rescue_button.textContent = "Rescue Mode";
    rescue_button.classList.add('rescue_mode_bttn')

    // Append the image and paragraph elements to the new kids_profile div
    child_div.appendChild(image);
    child_div.appendChild(name);
    child_div.appendChild(rescue_button);

    // Append the child profile to the parent section
    const kids_section = document.getElementById("kids");
    kids_section.appendChild(child_div);

    // Add event listener to the new kids_profile div for editing
    image.addEventListener("click", function () {
      edit_profile(child_div);
    });

    // Add event listener to the rescue mode button
    rescue_button.addEventListener("click", function () {
      // console.log("rescue button clicked")

      rescue_button.classList.toggle('clicked');
      var isClicked = rescue_button.classList.contains('clicked');

      if (isClicked) {
        rescue_button.style.backgroundColor = 'red'
      } else {
        rescue_button.style.backgroundColor = 'green'
      }
    });

    child_data = { first_name: firstName, last_name: lastName, parent_id: parentId }
    fetch('/create_child', {
      credentials: 'same-origin',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(child_data)
    })
      .then(response => response.json())
      .then(response => {
        childId = response.child_id;
        console.log("child_id:", childId);
        location.reload();
      });
    closeForm();

  });

}

// ----------------------------------------- EDITING CHILDREN -----------------------------------------
function edit_profile(profile) {
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

// ----------------------------------------- DISPLAY CHILDREN -----------------------------------------
async function display_children(url = "/display", verb = "GET", callback) {
  return fetch(url, {
    credentials: 'same-origin',
    method: verb,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
    .then((response) => response.json())
    .then((data) => {

      console.log("children: ", data);
      for (let id in data) {
        const child = data[id];
        const child_div = document.createElement("div");

        child_div.classList.add("kids_profile");

        const image = document.createElement("img");
        image.classList.add('profile_pic');
        image.src = "../public/images/blank_profile.png";
        const name = document.createElement("p");
        name.textContent = child.first_name + ' ' + child.last_name;

        const rescue_button = document.createElement("button");
        rescue_button.textContent = "Rescue Mode";
        rescue_button.classList.add('rescue_mode_bttn')
        rescue_button.id = `rescue_button_${child.child_id}`;

        // fetching and posting coordinates
        fetch_coordinates();
        post_coordinates('/location', 'POST', { child_id: child.child_id });

        // fetch coordinates every 60 seconds
        coordinates_interval = setInterval(fetch_coordinates, 15000);
        // post coordinates every 60 seconds
        posting_interval = setInterval(post_coordinates, 15000);

        // Add event listener to the rescue mode button
        rescue_button.addEventListener("click", function () {
          // Add your rescue mode logic here
          const button_id = this.id;
          console.log(`button: ${button_id}`);

          rescue_button.classList.toggle('clicked');
          var isClicked = rescue_button.classList.contains('clicked');

          if (isClicked) {
            rescue_button.style.backgroundColor = 'red'
          } else {
            rescue_button.style.backgroundColor = 'green'
          }

          // Check if the color is red
          if (rescue_button.style.backgroundColor === 'red') {
            rescue_coordinates();
            post_coordinates('/location', 'POST', { child_id: child.child_id });

            // clearing previous interval
            clearInterval(coordinates_interval);
            clearInterval(posting_interval);

            // fetch and post coordinates every 3 seconds in rescue mode
            coordinates_interval = setInterval(rescue_coordinates, 3000);
            posting_interval = setInterval(post_coordinates, 3000);

          } else {
            // clearing previous interval
            clearInterval(coordinates_interval);
            clearInterval(posting_interval);

            // fetching and posting coordinates
            fetch_coordinates();
            post_coordinates('/location', 'POST', { child_id: child.child_id });

            // fetch coordinates every 60 seconds
            coordinates_interval = setInterval(fetch_coordinates, 15000);
            // post coordinates every 60 seconds
            posting_interval = setInterval(post_coordinates, 15000);
          }
        });
        child_div.appendChild(image);
        child_div.appendChild(name);
        child_div.appendChild(rescue_button);
        const kids_section = document.getElementById("kids");
        kids_section.appendChild(child_div);
      }
      if (callback) callback(response);
    })
    .catch(error => console.error('Error:', error));
}
