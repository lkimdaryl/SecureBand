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
    // Handle Login POST Request
    let login_form = document.getElementById("login_form");
    if (login_form) { // in case we are not on the login page
      login_form.addEventListener('submit', (event) => {
        // Stop the default form behavior
        event.preventDefault();
  
        // Grab the needed form fields
        const action = login_form.getAttribute('action');
        const method = login_form.getAttribute('method');
        const data = {username: document.getElementById('username').value, password: document.getElementById('password').value};
  
        // Submit the POST request
        server_request(action, data, method, (response) => {
          user_id = response.user_id;
          if (response.session_id != 0) {
            console.log("yo!");
            this.location.replace("/dashboard");
          }
          else{
            alert("Invalid username and/or password. Try again.")
          }
        });
      });
    }
  });