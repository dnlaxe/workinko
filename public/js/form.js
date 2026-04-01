const form = document.querySelector("form");
const lastNextBtn = document.querySelector(".btn-last-next");
const steps = [...document.querySelectorAll(".step")];
const progressBars = [...document.querySelectorAll("[data-progress-index]")];

const specializationsByCategory = JSON.parse(form.dataset.specializations);
const citiesByProvince = JSON.parse(form.dataset.cities);

const state = {
  contactMethod: null,
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

const stepsConfig = [
  {
    /* purposefully empty */
  },
  { fields: ["category"] },
  { fields: ["specialization"] },
  { fields: ["province"] },
  { fields: ["city"] },
  { fields: ["koreanProficiency"] },
  { fields: ["englishProficiency"] },
  {
    /* purposefully empty */
  },
  { fields: ["contractType"] },
  { fields: ["visaSponsorship"] },
  { fields: ["startDate"] },
  { fields: ["heading", "subheading", "fullDescription"] },
];

let current = 0;

function showStep(index) {
  steps.forEach((s, i) => {
    s.hidden = index !== i;
    current = index;
    updateProgressBar();
    updateBtns();
  });
}

function updateProgressBar() {
  progressBars.forEach((bar, i) => {
    bar.classList.remove("bg-slate-200", "bg-red-500", "bg-blue-500");
    if (i < current) bar.classList.add("bg-blue-500");
    if (i === current) bar.classList.add("bg-red-500");
    if (i > current) bar.classList.add("bg-slate-200");
  });
}

function isStepComplete(index) {
  const steps = stepsConfig[index];
  return (steps.fields ?? []).every((field) => {
    const f = state[field];
    return f !== null && f !== "" && f !== undefined;
  });
}

function updateBtns() {
  lastNextBtn.disabled = !isStepComplete(current);
}

form.addEventListener("click", (e) => {
  if (e.target.closest(".btn-back") && current > 0) {
    showStep(current - 1);
  }
});

document.querySelectorAll("input[type=radio]").forEach((radio) => {
  radio.addEventListener("click", () => {
    state[radio.name] = radio.value;
    updateBtns();

    if (radio.value === "link" || radio.value === "provided") {
      return;
    }

    if (isStepComplete(current) && current < steps.length - 1) {
      showStep(current + 1);
    }

    console.log(state);
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
    if (isStepComplete(current) && current < steps.length - 1) {
      showStep(current + 1);
    }
  });
});

const category = document.querySelectorAll("input[name=category]");
const specialization = document.querySelectorAll("input[name=specialization]");

category.forEach((option) => {
  option.addEventListener("click", (e) => {
    const path = e.target.value;
    specialization.forEach((spec) => {
      const label = spec.closest("label");
      const allowedSet = new Set(specializationsByCategory[path]);
      label.hidden = !allowedSet.has(spec.value);
    });
  });
});

const province = document.querySelectorAll("input[name=province]");
const cities = document.querySelectorAll("input[name=city]");

province.forEach((option) => {
  option.addEventListener("click", (e) => {
    const path = e.target.value;
    cities.forEach((spec) => {
      const label = spec.closest("label");
      const allowedSet = new Set(citiesByProvince[path]);
      label.hidden = !allowedSet.has(spec.value);
    });
  });
});

updateBtns();
