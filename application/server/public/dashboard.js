document.addEventListener("DOMContentLoaded", function () {
  var add_member_button = document.querySelector("#add_member_bttn");
  var body = document.querySelector("body");

  add_member_button.addEventListener("click", function () {
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
      // Add your code here to handle form submission
      var firstName = firstNameInput.value;
      var lastName = lastNameInput.value;
      console.log("First Name:", firstName);
      console.log("Last Name:", lastName);

      // Create a new kids_profile div
      var newKidDiv = document.createElement('div');
      newKidDiv.classList.add('kids_profile');

      // Create an image element
      var imgElement = document.createElement('img');
      imgElement.src = "#"; // Set the image source here

      // Create a paragraph element with the kid's name
      var pElement = document.createElement('p');
      pElement.textContent = firstName + ' ' + lastName;

      // Append the image and paragraph elements to the new kids_profile div
      newKidDiv.appendChild(imgElement);
      newKidDiv.appendChild(pElement);

      // Append the new kids_profile div to the kidsSection
      kidsSection = document.querySelector('#kids')
      kidsSection.appendChild(newKidDiv);

      closeForm();
    });
  });

  function closeForm() {
    var overlay = document.querySelector('#overlay');
    overlay.remove();
    body.style.overflow = 'auto'; // Restore scrolling
  }
});
