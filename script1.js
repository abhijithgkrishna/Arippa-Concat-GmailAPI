// Get all dropdown options
      const dropdownOptions = document.querySelectorAll(".dropdown-content a");

      // Get the input fields
      const labelInput = document.getElementById("labelName");
      const criteriaInput = document.getElementById("criteriaInput");

      // Add click event listener to each option
      dropdownOptions.forEach((option) => {
        option.addEventListener("click", function () {
          // Update the dropdown button text
          document.querySelector(".dropbtn").innerText = this.innerText;

          // Remove 'selected' class from all options
          dropdownOptions.forEach((opt) => opt.classList.remove("selected"));

          // Add 'selected' class to the clicked option
          this.classList.add("selected");

        });
      });
