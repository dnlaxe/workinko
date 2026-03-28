import { updateNav } from "./navButtons.js";

const contactMethodInputs = Array.from(
  document.querySelectorAll('input[name="contactMethod"]'),
);
const contactFields = Array.from(
  document.querySelectorAll("[data-contact-field]"),
);

export function syncContactFields() {
  const selected = document.querySelector(
    'input[name="contactMethod"]:checked',
  )?.value;

  contactFields.forEach((field) => {
    const method = field.dataset.contactField;
    const isActive = method === selected;

    field.hidden = !isActive;

    if (isActive) {
      field.classList.remove("animate-fade-slide-up");
      void field.offsetWidth;
      field.classList.add("animate-fade-slide-up");
    }

    field.querySelectorAll("input, textarea, select").forEach((input) => {
      if (isActive) {
        input.disabled = false;
        input.required = true;
      } else {
        input.required = false;
        input.disabled = true;
      }
    });
  });
}

contactMethodInputs.forEach((input) => {
  input.addEventListener("change", () => {
    syncContactFields();
    updateNav();
  });
});

document.querySelector("form").addEventListener("input", () => {
  updateNav();
});

syncContactFields();
