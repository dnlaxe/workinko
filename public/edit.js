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

function validate(step) {
  return !step.querySelector(":invalid");
}

// reveal url or relay
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

// review builder
const fieldGroups = [
  ["contactMethod", "contactUrl"],
  ["category", "specialization"],
  ["province", "city"],
  ["koreanProficiency", "englishProficiency", "otherLanguages"],
  ["contractType", "visaSponsorship"],
  ["startDate"],
  ["heading", "subheading", "fullDescription"],
];

function buildReviewItem(entries, stepIndex) {
  const wrapper = document.createElement("div");
  wrapper.className = "border-b border-x border-slate-300 p-4 first:border-t";

  const header = document.createElement("div");
  header.className = "flex w-full flex-col items-start gap-2";

  const fields = document.createElement("div");
  for (const [name, value] of entries) {
    const dt = document.createElement("dt");
    dt.textContent = name;
    dt.className = "underline";

    const dd = document.createElement("dd");
    dd.textContent = value;

    fields.append(dt, dd);
  }

  const change = document.createElement("button");
  change.type = "button";
  change.textContent = "change";
  change.className = "self-end text-blue-500 underline";
  change.addEventListener("click", () => goToStep(stepIndex));

  header.append(fields, change);
  wrapper.append(header);

  for (const [name] of entries) {
    const errorEl = steps[stepIndex]?.querySelector(`[data-error="${name}"]`);
    if (errorEl) {
      const err = document.createElement("p");
      err.textContent = errorEl.textContent;
      wrapper.append(err);
    }
  }

  return wrapper;
}

function buildReview() {
  const data = new FormData(document.querySelector("form"));
  const dataMap = Object.fromEntries(data.entries());

  const heading = document.createElement("p");
  heading.textContent = "Please check your information";
  heading.className = "review-heading mb-2";

  const dl = document.createElement("dl");
  dl.className = "flex flex-col";

  for (const group of fieldGroups) {
    const entries = group
      .filter((name) => name in dataMap)
      .map((name) => [name, dataMap[name]]);

    if (entries.length === 0) continue;

    const stepIndex = nameToStep[entries[0][0]];
    dl.append(buildReviewItem(entries, stepIndex));
  }

  review.prepend(dl);
  review.prepend(heading);
}

// navigation
function updateNav() {
  btnBackToReview.disabled = !validate(steps[current]);
}

function show(index) {
  steps.forEach((step, i) => {
    step.hidden = i !== index;
  });
  updateNav();
  window.scrollTo(0, 0);
}

function goToStep(stepIndex) {
  review.querySelector("dl")?.remove();
  review.querySelector(".review-heading")?.remove();
  review.hidden = true;
  nav.hidden = false;
  btnBackToReview.hidden = false;
  current = stepIndex;
  show(current);
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
    updateNav();
  });
});

document.querySelector("form").addEventListener("input", () => {
  syncContactFields();
  updateNav();
});

syncContactFields();

showReview();
