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
    child_id = (window.location.href).split('/').pop();
    
    // GET the parent of the child
    fetch('/get_parent/' + child_id, {
        credentials: 'same-origin',
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(response => {
        console.log(response);
        childName = response[0] + ' ' + response[1]
        parentName = response[2] + ' ' + response[3]
        parentEmail = response[4]
        let infoContainer = document.getElementById('info_container');
        infoContainer.innerHTML = 
        `
        <h1> Child Name: ` + childName + `</h1>
        <img src="../public/images/blank_profile.png" alt="Description of the image">
        <h2> Parent Name: ` + parentName + `</h2>
        <h2> Parent Email: ` + parentEmail + `</h2>
        <h2> Parent Phone Number: 123-456-7890 </h2>
        `
    })

  });