const form = document.querySelector("form");
const lastNextBtn = document.querySelector(".btn-last-next");
const steps = [...document.querySelectorAll(".step")];
const progressBars = [...document.querySelectorAll("[data-progress-index]")];

const specializationsByCategory = JSON.parse(form.dataset.specializations);
const citiesByProvince = JSON.parse(form.dataset.cities);

const state = {
  contactMethod: null,
  sessionEmail: "",
  contactUrl: "",
  category: null,
  specialization: null,
  province: null,
  city: null,
  koreanProficiency: null,
  englishProficiency: null,
  otherLanguagesMode: null,
  otherLanguages: "",
  contractType: null,
  visaSponsorship: null,
  startDate: null,
  heading: "",
  subheading: "",
  fullDescription: "",
};

const fieldLabels = {
  contactMethod: "Contact method",
  sessionEmail: "Contact email",
  contactUrl: "Contact link",
  category: "Category",
  specialization: "Specialization",
  province: "Province",
  city: "City",
  koreanProficiency: "Korean proficiency",
  englishProficiency: "English proficiency",
  otherLanguages: "Other languages",
  contractType: "Contract type",
  visaSponsorship: "Visa sponsorship",
  startDate: "Start date",
  heading: "Heading",
  subheading: "Subheading",
  fullDescription: "Full description",
};

const stepsConfig = [
  { fields: ["contactMethod", "contactUrl", "sessionEmail"] },
  { fields: ["category"] },
  { fields: ["specialization"] },
  { fields: ["province"] },
  { fields: ["city"] },
  { fields: ["koreanProficiency"] },
  { fields: ["englishProficiency"] },
  { fields: ["otherLanguagesMode", "otherLanguages"] },
  { fields: ["contractType"] },
  { fields: ["visaSponsorship"] },
  { fields: ["startDate"] },
  { fields: ["heading", "subheading", "fullDescription"] },
  {
    /* purposefully empty */
  },
];

const STEPS = {
  CONTACT: 0,
  CATEGORY: 1,
  SPECIALIZATION: 2,
  PROVINCE: 3,
  CITY: 4,
  KOREAN_PROFICIENCY: 5,
  ENGLISH_PROFICIENCY: 6,
  OTHER_LANGUAGES: 7,
  CONTRACT_TYPE: 8,
  VISA_SPONSORSHIP: 9,
  START_DATE: 10,
  DESCRIPTION: 11,
  REVIEW: 12,
};

let current = 0;

function showStep(index) {
  steps.forEach((s, i) => {
    s.hidden = index !== i;
    current = index;
  });
  updateProgressBar();
  updateBtns();
}

function updateProgressBar() {
  progressBars.forEach((bar, i) => {
    bar.classList.remove("bg-slate-200", "bg-red-500/80", "bg-blue-500/80");
    if (i < current) bar.classList.add("bg-blue-500/80");
    if (i === current) bar.classList.add("bg-red-500/80");
    if (i > current) bar.classList.add("bg-slate-200");
  });
}

function isStepComplete() {
  const steps = stepsConfig[current];

  if (current === STEPS.CONTACT) {
    if (state.contactMethod === "relay") return true;
    // add email validation
    if (state.contactMethod === "link") return state.contactUrl !== "";
    return false;
  }

  if (current === STEPS.OTHER_LANGUAGES) {
    if (state.otherLanguagesMode === "notRequired") return true;
    if (state.otherLanguagesMode === "provided")
      return state.otherLanguages !== "";
    return false;
  }
  return (steps.fields ?? []).every((field) => {
    const f = state[field];
    return f !== null && f !== "" && f !== undefined;
  });
}

function updateBtns() {
  lastNextBtn.disabled = !isStepComplete();

  if (isEdit) {
    lastNextBtn.hidden = true;
    document.querySelectorAll("[data-step-inline-next]").forEach((btn) => {
      btn.hidden = true;
    });
  }
}

form.addEventListener("click", (e) => {
  if (e.target.closest(".btn-back") && current >= 0) {
    if (isEdit) {
      if (!isStepComplete()) return;
      if (current === STEPS.CATEGORY) updateChild("CATEGORY", "specialization");
      if (current === STEPS.PROVINCE) updateChild("PROVINCE", "city");
      buildReviewPage();
      showStep(STEPS.REVIEW);
    } else {
      showStep(current - 1);
    }
  }
});

function updateChild(parent, child) {
  if (current === STEPS[parent]) {
    state[child] = "";
    const isChecked = document.querySelector(`input[name=${child}]:checked`);
    if (isChecked) {
      isChecked.checked = false;
    }
  }
}

document.querySelectorAll("input[type=radio]").forEach((radio) => {
  radio.addEventListener("click", () => {
    state[radio.name] = radio.value;

    if (radio.value === "link" || radio.value === "provided") {
      radio
        .closest("label")
        .querySelector("input[type=url], input[type=text]")
        .focus();
      return;
    }

    if (isEdit) return;
    updateBtns();

    if (isStepComplete() && current < steps.length - 1) {
      showStep(current + 1);
    }
  });
});

document
  .querySelectorAll("input:not([type=radio]), textarea")
  .forEach((input) => {
    input.addEventListener("input", () => {
      state[input.name] = input.value;
      updateBtns();
    });
  });

document.querySelectorAll("[data-step-inline-next]").forEach((btn) => {
  const input = btn
    .closest("div")
    .querySelector("input[type=url], input[type=text]");
  const radio = input.closest("label").querySelector("input[type=radio]");
  btn.disabled = true;
  input.addEventListener("input", () => {
    // later add validation here!!
    btn.disabled = input.value.trim() === "";
  });
  input.addEventListener("focus", () => {
    if (!radio.checked) radio.click();
  });
  btn.addEventListener("click", () => {
    if (isStepComplete() && current < steps.length - 1) {
      showStep(current + 1);
    }
  });
});

const category = document.querySelectorAll("input[name=category]");
const specialization = document.querySelectorAll("input[name=specialization]");
const province = document.querySelectorAll("input[name=province]");
const cities = document.querySelectorAll("input[name=city]");

function optionBuilder(parent, map, path) {
  parent.forEach((spec) => {
    const label = spec.closest("label");
    const allowedSet = new Set(map[path]);
    label.hidden = !allowedSet.has(spec.value);
  });
}

category.forEach((option) => {
  option.addEventListener("click", (e) => {
    const path = e.target.value;
    optionBuilder(specialization, specializationsByCategory, path);
  });
});

province.forEach((option) => {
  option.addEventListener("click", (e) => {
    const path = e.target.value;
    optionBuilder(cities, citiesByProvince, path);
  });
});

const reviewStep = document.querySelector(".review");
const confirmBtn = document.querySelector(".btn-confirm");

let isEdit = false;

function buildReviewPage() {
  isEdit = true;

  reviewStep.textContent = "";

  Object.entries(fieldLabels).forEach(([key, value]) => {
    const stepIndex = stepsConfig.findIndex((step) =>
      step.fields?.includes(key),
    );

    if (key === "sessionEmail" && state.contactMethod !== "relay") return;
    if (key === "contactUrl" && state.contactMethod !== "link") return;

    const reviewLabel =
      key === "otherLanguages" && state.otherLanguagesMode === "notRequired"
        ? "Not required"
        : key === "specialization" && state.specialization === ""
          ? "Missing Information"
          : key === "city" && state.city === ""
            ? "Missing Information"
            : state[key];

    if (reviewLabel !== undefined && reviewLabel !== "") {
      const reviewItem = document.createElement("div");
      const reviewContent = document.createElement("p");
      if (fieldErrors?.[key]) reviewContent.classList.add("text-red-500");
      const editBtn = document.createElement("button");

      editBtn.classList.add(
        "py-1",
        "px-3",
        "font-mono",
        "uppercase",
        "text-sm",
        "text-[#FF000D]",
        "border",
        "border-[#FF000D]",
        "shrink-0",
        "self-start",
      );

      if (reviewLabel === "Missing Information") {
        editBtn.classList.add("bg-red-500/80", "text-white");
        reviewContent.textContent = `${value}: `;
        editBtn.textContent = `${reviewLabel}`;
      } else {
        editBtn.textContent = "change";
        reviewContent.textContent = `${value}: ${reviewLabel}`;
      }

      reviewStep.classList.add(
        "grid",
        "md:grid-cols-2",
        "gap-2",
        "lg:grid-cols-3",
      );
      reviewItem.classList.add(
        "border",
        "border-slate-200",
        "p-4",
        "flex",
        "justify-between",
        "gap-2",
      );

      if (key === "fullDescription")
        reviewItem.classList.add("md:col-span-2", "lg:col-span-3");

      editBtn.type = "button";

      reviewItem.append(reviewContent);
      reviewItem.append(editBtn);
      reviewStep.append(reviewItem);
      editBtn.addEventListener("click", () => showStep(stepIndex));
    }
  });

  reviewStep.append(confirmBtn);
}

function changeBackBtnToBackToReviewBtn() {
  const backButtons = document.querySelectorAll(".btn-back");
  backButtons.forEach((button) => {
    button.textContent = "";
    button.className += " py-1 px-3 font-mono uppercase text-sm! border";
    button.textContent = "Back to review";
  });
}

lastNextBtn.addEventListener("click", () => {
  buildReviewPage();
  showStep(STEPS.REVIEW);
  changeBackBtnToBackToReviewBtn();
});

updateBtns();

function rebuildState() {
  const values = getCurrentValues();
  Object.assign(state, values);
}

function getCurrentValues() {
  return Object.fromEntries(new FormData(form));
}

state["sessionEmail"] = document.querySelector(".sessionEmail").textContent;

const presentErrors = document.querySelector(".js-has-errors");
const fieldErrors = presentErrors
  ? JSON.parse(presentErrors.textContent)
  : null;

if (presentErrors) {
  isEdit = true;
  rebuildState();
  Object.assign(state, fieldErrors);
  buildReviewPage();
  changeBackBtnToBackToReviewBtn();
  showStep(STEPS.REVIEW);
}
