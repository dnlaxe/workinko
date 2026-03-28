import { steps, nameToStep } from "./stepMap.js";
import { current, setEditingFromReview } from "./state.js";
import { updateProgress } from "./progressBar.js";
import { goToStep } from "./navButtons.js";

const review = document.querySelector(".review");
const stepNav = document.querySelector(".step__nav");
const draftsBar = document.querySelector(".drafts-bar");

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
    const displayValue = valueMap[name]?.[value] ?? value ?? "";
    dd.textContent = displayValue;
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
  stepEl.textContent = "review";
  stepEl.className = "review-heading mb-8 uppercase tracking-wide text-xs";

  const heading = document.createElement("p");
  heading.textContent = "Please check your information";
  heading.className =
    "review-heading mb-2 uppercase tracking-wide p-8 bg-[#CBCCCE]/20 border border-[#CBCCCE] rounded";

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
  review.prepend(stepEl);
}

export function showReview() {
  setEditingFromReview(false);
  steps[current].hidden = true;
  stepNav.hidden = true;
  if (draftsBar) draftsBar.hidden = false;
  updateProgress(steps.length);
  buildReview();
  review.hidden = false;
}
