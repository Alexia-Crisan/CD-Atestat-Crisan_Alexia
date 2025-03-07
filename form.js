
      const scriptURL =
        "https://script.google.com/macros/s/AKfycbxFVYE4Z2JWCRM0wVoNw8MB_Qg9m57zn5KZgje6yCPIq-MG6FFqiAfzUmpvcl2iCeEw/exec";
      const form = document.forms["submit-to-google-sheet"];
      const successMessage = document.getElementById("success-message");

      form.addEventListener("submit", (e) => {
        e.preventDefault();

        fetch(scriptURL, { method: "POST", body: new FormData(form) })
          .then((response) => {
            console.log("Success!", response);
            form.reset();
            alert("Your form has been submitted successfully!");
          })
          .catch((error) => {
            console.error("Error!", error.message);
            alert("There was an error submitting the form. Please try again.");
          });
      });