let map;
let coordinates_interval;
let posting_interval;
let childId;
const body = document.querySelector("body");

document.addEventListener("DOMContentLoaded", function () {
    //Load Google Maps JavaScript API
    (g => {
      var h, a, k, p = "The Google Maps JavaScript API",
        c = "google",
        l = "importLibrary",
        q = "__ib__",
        m = document,
        b = window;
      b = b[c] || (b[c] = {});
      var d = b.maps || (b.maps = {}),
        r = new Set,
        e = new URLSearchParams,
        u = () => h || (h = new Promise(async (f, n) => {
          await (a = m.createElement("script"));
          e.set("libraries", [...r] + "");
          for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]);
          e.set("callback", c + ".maps." + q);
          a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
          d[q] = f;
          a.onerror = () => h = n(Error(p + " could not load."));
          a.nonce = m.querySelector("script[nonce]")?.nonce || "";
          m.head.append(a);
        }));
      d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n));
    });
    ({key: "AIzaSyDeOH7JuAUe3glWpRSgtTDUpj0Xye069Qo", v: "weekly"});

    // display children of user (if any)
    display_children();

    const add_member = document.querySelector("#add_member_bttn");
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
      if (callback)
        callback(response);
    })
    .catch(error => console.error('Error:', error));
}
// ----------------------------------------- HELPFUL FUNCTIONS -----------------------------------------
function closeForm() {
  let overlay = document.querySelector('#overlay');
  overlay.remove();
  body.style.overflow = 'auto'; // Restore scrolling
}
function getCookie(name) {
  let cookieArr = document.cookie.split(";");
  for (let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split("=");
    if (name === cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
}
// ----------------------------------------- ADDING CHILDREN -----------------------------------------
function create_child_elements(firstName, lastName, childID){
    const child_div = document.createElement("div");
    child_div.classList.add("kids_profile");

    const image = document.createElement("img");
    image.classList.add('profile_pic');
    image.src = "../public/images/blank_profile.png";

    const name = document.createElement("p");
    name.textContent = firstName + ' ' + lastName;

    const rescue_button = document.createElement("button");
    rescue_button.textContent = "Rescue Mode";
    rescue_button.classList.add('rescue_mode_bttn')
    if (childID){
        rescue_button.id = childID;
    }

    const update_button = document.createElement("button");
    update_button.textContent = "Update Info";

    const remove_button = document.createElement("button");
    remove_button.textContent = "Remove Child";

    child_div.appendChild(image);
    child_div.appendChild(name);
    child_div.appendChild(rescue_button);
    child_div.appendChild(update_button);
    child_div.appendChild(remove_button);

    const kids_section = document.getElementById("kids");
    kids_section.appendChild(child_div);

    update_button.addEventListener("click", function () {
      edit_profile(child_div, childID);
    });

    remove_button.addEventListener("click", function () {
        kids_section.removeChild(child_div);
        const requestData = {childID: childID};
        fetch("/remove_child", {
            credentials: "same-origin",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        })
    });

    rescue_button.addEventListener("click", function () {
        rescue_button.classList.toggle('clicked');
        let isClicked = rescue_button.classList.contains('clicked');

        if (isClicked) {
            rescue_button.style.backgroundColor = 'red';
        } else {
            rescue_button.style.backgroundColor = 'green';
        }

        if (rescue_button.style.backgroundColor === 'red') {
            rescue_coordinates();
            post_coordinates('/location', 'POST', { child_id: rescue_button.id });

            // clearing previous interval
            clearInterval(coordinates_interval);
            clearInterval(posting_interval);

            // fetch and post coordinates every 3 seconds in rescue mode
            coordinates_interval = setInterval(rescue_coordinates, 1000);
            posting_interval = setInterval(post_coordinates, 1000);
        } else {
            // clearing previous interval
            clearInterval(coordinates_interval);
            clearInterval(posting_interval);

            // fetching and posting coordinates
            fetch_coordinates();
            post_coordinates('/location', 'POST', { child_id: rescue_button.id });

            // fetch coordinates every 60 seconds
            coordinates_interval = setInterval(fetch_coordinates, 60000);
            // post coordinates every 60 seconds
            posting_interval = setInterval(post_coordinates, 60000);
        }
    });
}
function create_child_form(){
    const overlay = document.createElement('div');
    overlay.id = 'overlay';

    const form = document.createElement('form');
    form.id = 'member_form';

    const firstNameInput = document.createElement('input');
    firstNameInput.type = 'text';
    firstNameInput.placeholder = 'First Name';
    firstNameInput.name = 'first_name'

    const lastNameInput = document.createElement('input');
    lastNameInput.type = 'text';
    lastNameInput.placeholder = 'Last Name';
    lastNameInput.name = 'last_name'

    const closeButton = document.createElement('button');
    closeButton.id = 'close_button'
    closeButton.textContent = 'X';
    closeButton.addEventListener('click', function () {
    closeForm();
    });

    const submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = 'Submit';

    form.appendChild(closeButton);
    form.appendChild(firstNameInput);
    form.appendChild(lastNameInput);
    form.appendChild(submitButton);

    overlay.appendChild(form);
    body.appendChild(overlay);
    body.style.overflow = 'hidden';

    return {
        form: form,
        firstNameInput: firstNameInput,
        lastNameInput: lastNameInput
    };
}
function add_child() {
    const form_dict = create_child_form();
    const form = form_dict.form;
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        let firstName = form_dict.firstNameInput.value;
        let lastName = form_dict.lastNameInput.value;
        let parentId = getCookie("user_id");

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
            create_child_elements(firstName, lastName, childId);
            location.reload();
        });
        closeForm();
    });
}
// ----------------------------------------- EDITING CHILDREN -----------------------------------------
function edit_profile(profile, childID) {
    const form_dict = create_child_form();
    const form = form_dict.form;
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        let firstName = form_dict.firstNameInput.value;
        let lastName = form_dict.lastNameInput.value;

        let this_kid = document.querySelector('.kids_profile p');
        this_kid.innerHTML = firstName + ' ' + lastName;

        // Send updated data to the server
        let childData = {
            first_name: firstName,
            last_name: lastName,
            child_id: childID
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
        for (let id in data) {
            const child = data[id];
            create_child_elements(child.first_name, child.last_name, child.child_id);

            fetch_coordinates();
            post_coordinates('/location', 'POST', { child_id: child.child_id });

            // fetch coordinates every 60 seconds
            coordinates_interval = setInterval(fetch_coordinates, 60000);
            // post coordinates every 60 seconds
            posting_interval = setInterval(post_coordinates, 60000);
        }
        if (callback) callback(response);
    })
    .catch(error => console.error('Error:', error));
}
