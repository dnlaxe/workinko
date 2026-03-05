const steps = Array.from(document.querySelectorAll(".step"));
const btnBack = document.querySelector(".btn-back");
const btnNext = document.querySelector(".btn-next");
const lastBtnNext = document.querySelector(".btn-last-next");
const btnBackToReview = document.querySelector(".btn-back-to-review");
const review = document.querySelector(".review");
const nav = document.querySelector(".step__nav");
let current = 0;
let editingFromReview = false;

const nameToStep = {};
steps.forEach((step, i) => {
  step.querySelectorAll("[name]").forEach((input) => {
    nameToStep[input.name] = i;
  });
});

function validate(step) {
  const radios = step.querySelectorAll('input[type="radio"][required]');
  if (radios.length) return Array.from(radios).some((r) => r.checked);
  const fields = step.querySelectorAll("input[required], textarea[required]");
  return Array.from(fields).every((f) => f.value.trim() !== "");
}

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
  updateNav();
}

function buildReview() {
  const data = new FormData(document.querySelector("form"));
  const dl = document.createElement("dl");
  for (const [name, value] of data.entries()) {
    const dt = document.createElement("dt");
    dt.textContent = name;
    const dd = document.createElement("dd");
    dd.textContent = value;

    const change = document.createElement("button");
    change.type = "button";
    change.textContent = "change";
    const stepIndex = nameToStep[name];
    change.addEventListener("click", () => {
      editingFromReview = true;
      dl.remove();
      review.hidden = true;
      nav.hidden = false;
      current = stepIndex;
      show(current);
    });

    const errorEl = steps[stepIndex].querySelector(`[data-error="${name}"]`);
    if (errorEl) {
      const err = document.createElement("p");
      err.textContent = errorEl.textContent;
      dl.append(dt, dd, change, err);
    } else {
      dl.append(dt, dd, change);
    }
  }

  review.prepend(dl);
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
  buildReview();
  review.hidden = false;
}

lastBtnNext.addEventListener("click", showReview);
btnBackToReview.addEventListener("click", showReview);

document.querySelector("form").addEventListener("input", updateNav);

show(0);

if (document.querySelector("form").dataset.hasErrors !== undefined) {
  showReview();
}
