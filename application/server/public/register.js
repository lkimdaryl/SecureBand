document.addEventListener("DOMContentLoaded", function () {
    //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
    // Define the 'request' function to handle interactions with the server
    function server_request(url, data={}, verb, callback) {
      return fetch(url, {
        credentials: 'same-origin',
        method: verb,
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
      })
      .then(response => response.json())
      .then(response => {
        if(callback)
          callback(response);
      })
      .catch(error => console.error('Error:', error));
    }
    //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

    // Form and entry fields
    const registerForm = document.getElementById("register_form");
    const firstNameField = document.getElementById("first_name");
    const lastNameField = document.getElementById("last_name");
    const emailField = document.getElementById("email");
    const usernameField = document.getElementById("username");
    const passwordField = document.getElementById("password");
    const confirmPasswordField = document.getElementById("confirm_password");

    // Div container to display any invalid entries when trying to submit register form
    var invalidEntriesMsg = document.getElementById("invalid-entries-msg");
    var invalidEntriesList = document.getElementById("invalid-entries-list");

    // List data structure to keep track of invalid entries
    var invalids = [];

    //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
    
    registerForm.addEventListener('submit', (e) => {
        // Prevent default
        e.preventDefault()

        // Front-end validation flag
        frontendValidated = true;

        // Reset invalid entries fields in UI
        invalidEntriesMsg.hidden = true;
        while (invalidEntriesList.firstChild) {
            invalidEntriesList.removeChild(invalidEntriesList.firstChild);
        }
        
        /*
        *   Validate first name
        */
        // If first name is just whitespace
        if(/^\s*$/.test(firstNameField.value)){
            addInvalidEntry("First name cannot be empty");
            invalidEntriesMsg.hidden = false;
            frontendValidated = false;
        }

        /*
        *   Validate last name
        */
        // If last name is just whitespace
        if(/^\s*$/.test(lastNameField.value)){
            addInvalidEntry("Last name cannot be empty");
            invalidEntriesMsg.hidden = false;
            frontendValidated = false;
        }

        /*
        *   Validate username
        */
        // If username has non alpha-numeric characters
        if(/[^a-zA-Z0-9]/.test(usernameField.value)){
            addInvalidEntry("Username cannot contain non alpha-numeric characters");
            invalidEntriesMsg.hidden = false;
            frontendValidated = false;
        }

        /*
        *   Validate password
        */
        // If password and confirm password fields don't match
        if(passwordField.value != confirmPasswordField.value){
            addInvalidEntry("Passwords do not match");
            invalidEntriesMsg.hidden = false;
            frontendValidated = false;
        }

        /*
        *   If front-end has been validated, begin validating on back-end
        */
        if(frontendValidated){
            // Check if email does not already exist in database
            fetch('/nonexistent_email/' + emailField.value, {
                credentials: 'same-origin',
                method: 'GET',
                headers: {'Content-Type': 'application/json'}
            })
            .then(response => response.json())
            .then(response => {
                // If email already exists in database, add invalid flags to UI
                if(response == "false"){
                    addInvalidEntry("Account with this email already exists");
                    invalidEntriesMsg.hidden = false;
                }
                // Check if username does not already exist in database
                fetch('/nonexistent_username/' + usernameField.value, {
                    credentials: 'same-origin',
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                })
                .then(response2 => response2.json())
                .then(response2 => {
                    // If username already exists in database, add invalid flags to UI
                    if(response2 == "false"){
                        addInvalidEntry("Account with this username already exists");
                        invalidEntriesMsg.hidden = false;
                    } 
                    // At this point, all fields have been validated. Ready to add account to database
                    else{
                        // Grab the needed form fields
                        const action = registerForm.getAttribute('action');
                        const method = registerForm.getAttribute('method');
                        const user = {
                            'email': emailField.value, 
                            'first_name': firstNameField.value,
                            'last_name': lastNameField.value, 
                            'username': usernameField.value,
                            'password': passwordField.value
                        };
                        console.log(action, method, user);
                        // Submit the POST request
                        server_request(action, user, method, (response) => {
                        this.location.replace('/login');
                        if(response["success"] == true) alert("Successfully created account! Redirecting you to login");
                        });

                    }
                });
            });
        }
    });

    //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

    function addInvalidEntry(message){

        // Create a new list item and append to invalid entries list
        var invalidEntry = document.createElement("li")
        invalidEntriesList.appendChild(invalidEntry);

        //Set the list item's text to the message variable
        invalidEntry.innerHTML = message;
    }

  });