const form = document.querySelector("form");
const specializationsByCategory = JSON.parse(form.dataset.specializations);
const citiesByProvince = JSON.parse(form.dataset.cities);

function setUp(parentName, childName, allowedOptions) {
  const parentInputs = Array.from(
    document.querySelectorAll(`input[name="${parentName}"]`),
  );
  const childInputs = Array.from(
    document.querySelectorAll(`input[name="${childName}"]`),
  );

  if (!parentInputs || !childInputs) return;

  function update() {
    const selectedParentValue = document.querySelector(
      `input[name="${parentName}"]:checked`,
    )?.value;

    const validOptions = new Set(allowedOptions[selectedParentValue]);

    childInputs.forEach((input) => {
      const label = input.closest("label");
      const isAllowed = validOptions.has(input.value);

      input.hidden = !isAllowed;
      if (label) label.hidden = !isAllowed;
    });

    childInputs
      .filter((input) => validOptions.has(input.value))
      .forEach((input, i) => {
        const label = input.closest("label");
        if (!label) return;
        label.classList.remove("animate-fade-slide-up");
        void label.offsetWidth;
        label.style.animationDelay = `${i * 50}ms`;
        label.classList.add("animate-fade-slide-up");
      });

    childInputs[0]
      ?.closest(".step")
      ?.querySelector(".select-tag-hint")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  parentInputs.forEach((input) => {
    input.addEventListener("change", update);
  });
  update();
}

setUp("category", "specialization", specializationsByCategory);
setUp("province", "city", citiesByProvince);
