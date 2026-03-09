const steps = Array.from(document.querySelectorAll(".step"));
const btnBackToReview = document.querySelector(".btn-back-to-review");
const review = document.querySelector(".review");
const nav = document.querySelector(".step__nav");
const contactMethodInputs = Array.from(
  document.querySelectorAll('input[name="contactMethod"]'),
);
const contactFields = Array.from(
  document.querySelectorAll("[data-contact-field]"),
);
let current = 0;

const nameToStep = {};
steps.forEach((step, i) => {
  step.querySelectorAll("[name]").forEach((input) => {
    nameToStep[input.name] = i;
  });
});

function syncContactFields() {
  const selected = document.querySelector(
    'input[name="contactMethod"]:checked',
  )?.value;

  contactFields.forEach((field) => {
    const method = field.dataset.contactField;
    const isActive = method === selected;

    field.hidden = !isActive;

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

function show(index) {
  steps.forEach((step, i) => {
    step.hidden = i !== index;
  });
}

function goToStep(stepIndex) {
  btnBackToReview.hidden = false;
  review.querySelector("dl")?.remove();
  review.hidden = true;
  nav.hidden = false;
  current = stepIndex;
  show(current);
}

function buildReviewItem(name, value, stepIndex) {
  const dt = document.createElement("dt");
  dt.textContent = name;

  const dd = document.createElement("dd");
  dd.textContent = value;

  const change = document.createElement("button");
  change.type = "button";
  change.textContent = "change";
  change.addEventListener("click", () => goToStep(stepIndex));

  const errorEl = steps[stepIndex].querySelector(`[data-error="${name}"]`);
  if (errorEl) {
    const err = document.createElement("p");
    err.textContent = errorEl.textContent;
    return [dt, dd, change, err];
  }
  return [dt, dd, change];
}

function buildReview() {
  const data = new FormData(document.querySelector("form"));
  const dl = document.createElement("dl");
  for (const [name, value] of data.entries()) {
    dl.append(...buildReviewItem(name, value, nameToStep[name]));
  }
  review.prepend(dl);
}

function showReview() {
  steps[current].hidden = true;
  nav.hidden = true;
  buildReview();
  review.hidden = false;
}

btnBackToReview.addEventListener("click", showReview);

contactMethodInputs.forEach((input) => {
  input.addEventListener("change", () => {
    syncContactFields();
  });
});

document.querySelector("form").addEventListener("input", () => {
  syncContactFields();
});

syncContactFields();

showReview();
