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

    // Confirmation Form
    let confirmationForm = document.getElementById('confirmation-form');

    // Fetch user data to display
    fetch('/session_data', {
         credentials: 'same-origin',
         method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(response => {

        // User info displays
        document.getElementById('hello_header').innerHTML = 'Hello, ' + response['first_name'] + ' ' + response['last_name'] + '!';
        document.getElementById('curr_username_header').innerHTML = 'Current Username: ' + response['username'];
        document.getElementById('curr_email_header').innerHTML = 'Current Email: ' + response['email'];

        /*
        *   Update the username 
        */
        let updateUsernameForm = document.getElementById("update_username_form");
        let confirmationModal = document.getElementById("confirmation-modal");
        let usernameField = document.getElementById("username");
        let closeModal = document.getElementById("close-modal-button");
        closeModal.onclick = function() {
            confirmationModal.style.display = "none";
            location.reload();
        };
        if(updateUsernameForm){
            updateUsernameForm.addEventListener('submit', (event) => {
                event.preventDefault();

                // Case where username is invalid
                if(/[^a-zA-Z0-9]/.test(usernameField.value)){
                    console.log('invalid username');
                    alert('Username is invalid! Cannot contain non alpha-numeric characters!');
                }
                // Else, proceed to valid case
                else{
                    // Display the confirmation modal
                    confirmationModal.style.display = "block";
                    confirmationForm.addEventListener('submit', (event) => {
                        event.preventDefault();

                        // Call the verify password method
                        const action = confirmationForm.getAttribute('action');
                        const method = confirmationForm.getAttribute('method');
                        const user = {
                            'username': response['username'],
                            'password': document.getElementById('confirm_password').value
                        };
                        // Submit the POST request
                        server_request(action, user, method, (verified) => {
                            // If password is verified, attempt to update username
                            if(verified){

                                fetch('/nonexistent_username/' + usernameField.value, {
                                    credentials: 'same-origin',
                                    method: 'GET',
                                    headers: {'Content-Type': 'application/json'}
                                })
                                .then(response2 => response2.json())
                                .then(response2 => {
                                    // Username does not exist in DB, update the username
                                    if(response2 == 'true'){
                                        server_request('/update_username', {user_id: response['user_id'], username: usernameField.value}, 'PUT', (response3) => {
                                            console.log('updated username!');

                                            // UPDATE SESSION DATA!
                                            session_data = {
                                                'user_id': response['user_id'],
                                                'username': usernameField.value,
                                                'email': response['email'],
                                                'first_name': response['first_name'],
                                                'last_name': response['last_name'],
                                                'logged_in': response['logged_in']
                                            }
                                            server_request('/update_session_data', session_data, 'PUT', (updated) => {
                                                location.reload();
                                            });
                                        });
                                    }
                                    // Username already exists
                                    else{
                                        alert('Username already exists. Try again.')
                                    }
                                });

                            }
                            // Else, display message saying password incorrect
                            else{
                                alert('Password is incorrect.');
                            }
                        });
                    });
                }
            });
        }

        /*
        *   Update the email 
        */
        let updateEmailForm = document.getElementById("update_email_form");
        let emailField = document.getElementById("email");
        if(updateEmailForm){
            updateEmailForm.addEventListener('submit', (event) => {
                event.preventDefault();

                // Display the confirmation modal
                confirmationModal.style.display = "block";
                confirmationForm.addEventListener('submit', (event) => {
                    event.preventDefault();

                    // Call the verify password method
                    const action = confirmationForm.getAttribute('action');
                    const method = confirmationForm.getAttribute('method');
                    const user = {
                        'username': response['username'],
                        'password': document.getElementById('confirm_password').value
                    };
                    // Submit the POST request
                    server_request(action, user, method, (verified) => {
                        // If password is verified, attempt to update email
                        if(verified){
                            fetch('/nonexistent_email/' + emailField.value, {
                                credentials: 'same-origin',
                                method: 'GET',
                                headers: {'Content-Type': 'application/json'}
                            })
                            .then(response2 => response2.json())
                            .then(response2 => {
                                // Email does not exist in DB, update the username
                                if(response2 == 'true'){
                                    server_request('/update_email', {user_id: response['user_id'], email: emailField.value}, 'PUT', (response3) => {
                                        console.log('updated email!');

                                        // UPDATE SESSION DATA!
                                        session_data = {
                                            'user_id': response['user_id'],
                                            'username': response['username'],
                                            'email': emailField.value,
                                            'first_name': response['first_name'],
                                            'last_name': response['last_name'],
                                            'logged_in': response['logged_in']
                                        }
                                        server_request('/update_session_data', session_data, 'PUT', (updated) => {
                                            location.reload();
                                        });
                                    });
                                }
                                // Email already exists
                                else{
                                    alert('Email already exists. Try again.')
                                }
                            });

                        }
                        // Else, display message saying password incorrect
                        else{
                            alert('Password is incorrect.');
                        }
                    });
                });
            });
        }



        /*
        *   Update the password 
        */
        let updatePasswordForm = document.getElementById("update_password_form");
        let newPasswordField = document.getElementById("newPassword");
        let confirmNewPasswordField = document.getElementById("confirmNewPassword");
        if(updatePasswordForm){
            updatePasswordForm.addEventListener('submit', (event) => {
                event.preventDefault();

                // Validate password fields
                if(newPasswordField.value == confirmNewPasswordField.value){
                    // Display the confirmation modal
                    confirmationModal.style.display = "block";
                    confirmationForm.addEventListener('submit', (event) => {
                        event.preventDefault();

                        // Call the verify password method
                        const action = confirmationForm.getAttribute('action');
                        const method = confirmationForm.getAttribute('method');
                        const user = {
                            'username': response['username'],
                            'password': document.getElementById('confirm_password').value
                        };
                        // Submit the POST request
                        server_request(action, user, method, (verified) => {
                            // If password is verified, attempt to update password
                            if(verified){                                                                                           
                                server_request('/update_password', {user_id: response['user_id'], password: newPasswordField.value}, 'PUT', (response3) => {
                                    console.log('updated password!');
                                    location.reload();
                                });            
                            }
                            // Else, display message saying password incorrect
                            else{
                                alert('Password is incorrect.');
                            }
                        });
                    });
                }
                else{
                    alert('New passwords do not match')
                }
            });
        }


    });

    //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

  });