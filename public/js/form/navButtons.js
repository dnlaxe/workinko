import { steps } from "./stepMap.js";
import {
  current,
  editingFromReview,
  setCurrent,
  setEditingFromReview,
} from "./state.js";
import { updateProgress } from "./progressBar.js";

const btnBack = document.querySelector(".btn-back");
const btnNext = document.querySelector(".btn-next");
const lastBtnNext = document.querySelector(".btn-last-next");
const btnBackToReview = document.querySelector(".btn-back-to-review");
const review = document.querySelector(".review");
const stepNav = document.querySelector(".step__nav");
const draftsBar = document.querySelector(".drafts-bar");

export function validate(step) {
  return !step.querySelector(":invalid");
}

export function updateNav() {
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

export function showStep(index) {
  steps.forEach((step, i) => {
    step.hidden = i !== index;
  });

  const currentStep = steps[index];
  currentStep
    .querySelectorAll("label:has(input[type='radio'])")
    .forEach((label, i) => {
      label.classList.remove("animate-fade-slide-up");
      void label.offsetWidth;
      label.style.animationDelay = `${i * 50}ms`;
      label.classList.add("animate-fade-slide-up");
    });

  updateProgress(index);
  updateNav();
  window.scrollTo(0, 0);
}

export function goToStep(stepIndex) {
  setEditingFromReview(true);
  review.querySelector("dl")?.remove();
  review.querySelectorAll(".review-heading").forEach((el) => el.remove());
  review.hidden = true;
  stepNav.hidden = false;
  if (draftsBar) draftsBar.hidden = false;
  setCurrent(stepIndex);
  showStep(stepIndex);
}

btnBack.addEventListener("click", () => {
  if (current > 0) {
    const prevIndex = current - 1;
    setCurrent(prevIndex);
    showStep(prevIndex);
  }
});

btnNext.addEventListener("click", () => {
  if (current < steps.length - 1) {
    const nextIndex = current + 1;
    setCurrent(nextIndex);
    showStep(nextIndex);
  }
});
