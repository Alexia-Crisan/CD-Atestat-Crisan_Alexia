document.addEventListener("DOMContentLoaded", function () {
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    const sections = document.querySelectorAll(".section");
  
    function updateProducts() {
      const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
      
      sections.forEach((section) => {
        const category = section.classList[1];
        const isCategorySelected = Array.from(checkboxes).some(checkbox => checkbox.checked && checkbox.dataset.category === category);
        
        section.style.display = isCategorySelected || !anyChecked ? "flex" : "none";
      });
    }
  
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", updateProducts);
    });
  
    updateProducts();
  });
  