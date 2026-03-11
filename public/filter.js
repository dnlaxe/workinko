const filterBtn = document.querySelector(".filterBtn");
const filter = document.querySelector(".filter");

filterBtn.addEventListener("click", () => {
  filter.classList.toggle("max-h-0");
  filter.classList.toggle("max-h-120");
});
