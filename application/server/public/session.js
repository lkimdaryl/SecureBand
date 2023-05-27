/*
*   Used to handle view modifications on the client side based on session status from the server side
*/
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
    // Check if user is logged in
    fetch('/session_status', {
        credentials: 'same-origin',
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(response => {
        if(response['success']==true) {
            document.getElementById('dashtab').hidden = false;
            document.getElementById('logout_button').hidden = false;
            document.getElementById('signup').hidden = true;
            document.getElementById('login').hidden = true;
            //document.getElementById('abouttab').hidden = true;
            //document.getElementById('contacttab').hidden = true;
            //document.getElementById('hometab').hidden = true;
        }
        else{
            document.getElementById('dashtab').hidden = true;
            document.getElementById('logout_button').hidden = true;
            document.getElementById('signup').hidden = false;
            document.getElementById('login').hidden = false;
        }
    });
  
  });