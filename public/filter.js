document.querySelectorAll(".filter-form input[type=checkbox]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    checkbox.closest("form").submit();
  });
});
