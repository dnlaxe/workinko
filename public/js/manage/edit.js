const form = document.querySelector("form");
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

const fieldGroups = [
  ["contactUrl"],
  ["category", "specialization"],
  ["province", "city"],
  ["koreanProficiency", "englishProficiency", "otherLanguages"],
  ["contractType", "visaSponsorship"],
  ["startDate"],
  ["heading", "subheading", "fullDescription"],
];

const valueMap = {
  koreanProficiency: {
    0: "Not Required",
    1: "Beginner Korean",
    2: "Intermediate Korean",
  },
  englishProficiency: {
    0: "Not Required",
    1: "Beginner English",
    2: "Intermediate English",
  },
};

function buildReviewItem(entries, stepIndex) {
  const wrapper = document.createElement("div");
  wrapper.className = "border-b px-4 py-4 first:border-t border-[#CBCCCE]";

  const stepLabel = steps[stepIndex]?.querySelector("h1");
  if (stepLabel) {
    const label = document.createElement("p");
    label.textContent = stepLabel.textContent;
    label.className = "text-xs uppercase tracking-wider mb-2";
    wrapper.append(label);
  }

  const header = document.createElement("div");
  header.className = "flex w-full flex-col items-start gap-2";

  const fields = document.createElement("div");
  for (const [name, value] of entries) {
    const dd = document.createElement("dd");
    dd.textContent = valueMap[name]?.[value] ?? value ?? "";
    if (name === "fullDescription") dd.style.whiteSpace = "pre-line";
    fields.append(dd);
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

  const stepEl = document.createElement("p");
  stepEl.textContent = "edit";
  stepEl.className = "review-heading py-4 uppercase tracking-wide text-xs";

  const heading = document.createElement("p");
  heading.textContent = "Edit your information and click confirm to save";
  heading.className =
    "review-heading mb-2 uppercase tracking-wide p-8 bg-[#CBCCCE]/20 border border-[#CBCCCE] rounded";

  const dl = document.createElement("dl");
  dl.className = "flex flex-col";

  if (dataMap.contactMethod === "relay") {
    const email =
      steps[0].querySelector('[data-contact-field="relay"] strong')
        ?.textContent ?? "";
    dl.append(buildReviewItem([["contactEmail", email]], 0));
  }

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
  review.prepend(stepEl);
}

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
  review.querySelectorAll("dl, .review-heading").forEach((el) => el.remove());
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

const specializationsByCategory = JSON.parse(form.dataset.specializations);
const citiesByProvince = JSON.parse(form.dataset.cities);

function setUpDependentOptions(parentName, childName, allowedOptions) {
  const parentInputs = Array.from(
    document.querySelectorAll(`input[name="${parentName}"]`),
  );
  const childInputs = Array.from(
    document.querySelectorAll(`input[name="${childName}"]`),
  );

  function update() {
    const selected = document.querySelector(
      `input[name="${parentName}"]:checked`,
    )?.value;
    const validOptions = new Set(allowedOptions[selected]);
    childInputs.forEach((input) => {
      const label = input.closest("label");
      const isAllowed = validOptions.has(input.value);
      input.hidden = !isAllowed;
      if (label) label.hidden = !isAllowed;
    });
  }

  parentInputs.forEach((input) => input.addEventListener("change", update));
  update();
}

setUpDependentOptions("category", "specialization", specializationsByCategory);
setUpDependentOptions("province", "city", citiesByProvince);

showReview();
