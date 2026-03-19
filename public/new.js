const steps = Array.from(document.querySelectorAll(".step"));
const btnBack = document.querySelector(".btn-back");
const btnNext = document.querySelector(".btn-next");
const lastBtnNext = document.querySelector(".btn-last-next");
const btnBackToReview = document.querySelector(".btn-back-to-review");
const review = document.querySelector(".review");
const nav = document.querySelector(".step__nav");
const draftsBar = document.querySelector(".drafts-bar");
const progressParts = Array.from(
  document.querySelectorAll("[data-progress-index]"),
);
const contactMethodInputs = Array.from(
  document.querySelectorAll('input[name="contactMethod"]'),
);
const contactFields = Array.from(
  document.querySelectorAll("[data-contact-field]"),
);
let current = 0;
let editingFromReview = false;

const nameToStep = {};
steps.forEach((step, i) => {
  step.querySelectorAll("[name]").forEach((input) => {
    nameToStep[input.name] = i;
  });
});

function validate(step) {
  return !step.querySelector(":invalid");
}

function updateProgress(index) {
  progressParts.forEach((part, i) => {
    part.classList.remove(
      "bg-slate-200",
      "bg-blue-300",
      "bg-green-300",
      "bg-[#41C3DD]",
      "bg-[#41C3DD]/60",
    );

    if (i < index) {
      part.classList.add("bg-[#41C3DD]/60");
    } else if (i === index) {
      part.classList.add("bg-[#41C3DD]");
    } else {
      part.classList.add("bg-slate-200");
    }
  });

  const counter = document.querySelector(".step-counter");
  if (counter) {
    const step = Math.min(index + 1, progressParts.length);
    counter.textContent = `Step ${step} of ${progressParts.length}`;
  }
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
  wrapper.className = "border-b border-x p-4 first:border-t border-[#CBCCCE]";

  const stepLabel = steps[stepIndex]?.querySelector("h1");
  if (stepLabel) {
    const label = document.createElement("p");
    label.textContent = stepLabel.textContent;
    label.className = "text-xs uppercase tracking-widest mb-2";
    wrapper.append(label);
  }

  const header = document.createElement("div");
  header.className = "flex w-full flex-col items-start gap-2";

  const fields = document.createElement("div");
  for (const [name, value] of entries) {
    const dd = document.createElement("dd");
    const displayValue = valueMap[name]?.[value] ?? value ?? "";
    dd.textContent = displayValue;

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

  const heading = document.createElement("p");
  heading.textContent = "Please check your information";
  heading.className = "review-heading mb-2 mt-6";

  const dl = document.createElement("dl");
  dl.className = "flex flex-col";

  if (dataMap.contactMethod === "relay") {
    const email =
      steps[0].querySelector('[data-contact-field="relay"] strong')
        ?.textContent ?? "";
    dl.append(buildReviewItem([["sessionEmail", email]], 0));
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
}

// navigation
function updateNav() {
  if (editingFromReview) {
    btnBack.hidden = true;
    btnNext.hidden = true;
    lastBtnNext.hidden = true;
    btnBackToReview.hidden = false;
    btnBackToReview.disabled = !validate(steps[current]);
    return;
  }
  const isLast = current === steps.length - 1;
  btnBack.hidden = current === 0;
  btnNext.hidden = isLast;
  lastBtnNext.hidden = !isLast;
  const activeBtn = isLast ? lastBtnNext : btnNext;
  activeBtn.disabled = !validate(steps[current]);
}

function show(index) {
  steps.forEach((step, i) => {
    step.hidden = i !== index;
  });
  updateProgress(index);
  updateNav();
  window.scrollTo(0, 0);
}

function goToStep(stepIndex) {
  editingFromReview = true;
  review.querySelector("dl")?.remove();
  review.querySelector(".review-heading")?.remove();
  review.hidden = true;
  nav.hidden = false;
  if (draftsBar) draftsBar.hidden = false;
  current = stepIndex;
  show(current);
}

btnBack.addEventListener("click", () => {
  if (current > 0) show(--current);
});

btnNext.addEventListener("click", () => {
  if (current < steps.length - 1) show(++current);
});

function showReview() {
  editingFromReview = false;
  steps[current].hidden = true;
  nav.hidden = true;
  if (draftsBar) draftsBar.hidden = false;
  updateProgress(steps.length);
  buildReview();
  review.hidden = false;
}

lastBtnNext.addEventListener("click", showReview);
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

if (document.querySelector("form").dataset.hasErrors !== undefined) {
  show(current);
  showReview();
} else {
  show(0);
}
