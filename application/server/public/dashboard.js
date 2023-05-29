document.addEventListener("DOMContentLoaded", function () {
    var body = document.querySelector("body");

    var add_member_button = document.querySelector("#add_member_bttn");
    add_member_button.addEventListener("click", function () {
        create_profile();
    });

    var kidsProfiles = document.querySelectorAll(".kids_profile")
    kidsProfiles.forEach(function (profile) {
        profile.addEventListener("click", function () {
            edit_profile();
        });
    });


    function closeForm() {
        var overlay = document.querySelector('#overlay');
        overlay.remove();
        body.style.overflow = 'auto'; // Restore scrolling
    }

    function create_profile(){
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

            // Create a new kids_profile div
            var newKidDiv = document.createElement('div');
            newKidDiv.classList.add('kids_profile');

            // Create an image element
            var imgElement = document.createElement('img');
            imgElement.classList.add('profile_pic');
            imgElement.src = "../public/images/blank_profile.png"; // Set the image source here

            // Create a paragraph element with the kid's name
            var pElement = document.createElement('p');
            pElement.textContent = firstName + ' ' + lastName;

            // Append the image and paragraph elements to the new kids_profile div
            newKidDiv.appendChild(imgElement);
            newKidDiv.appendChild(pElement);

            // Append the new kids_profile div to the kidsSection
            kidsSection = document.querySelector('#kids')
            kidsSection.appendChild(newKidDiv);

            child_data = {first_name: firstName, last_name: lastName, parent_id: parentId}
            fetch('/create_child', {
                credentials: 'same-origin',
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(child_data)
            })
            .then(response => response.json())
            .then(response => {
                console.log(response)
            });
            closeForm();
        });
    }

    function edit_profile(){
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

            closeForm();
        });
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



});//end
