const specializationsByCategory = {
  Teaching: [
    "Kindergarten",
    "Elementary",
    "Middle School",
    "High School",
    "University",
    "Corporate English",
    "Private Tutoring",
  ],
  "Non-teaching": [
    "Frontend",
    "Backend",
    "Full-stack",
    "Design",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Customer Support",
  ],
};

const citiesByProvince = {
  Seoul: ["Seoul"],
  Busan: ["Busan"],
  Daegu: ["Daegu"],
  Incheon: ["Incheon"],
  Gwangju: ["Gwangju"],
  Daejeon: ["Daejeon"],
  Ulsan: ["Ulsan"],
  Sejong: ["Sejong"],
  "Gyeonggi-do": ["Suwon", "Seongnam", "Goyang", "Yongin", "Bucheon", "Ansan", "Anyang", "Namyangju", "Hwaseong", "Uijeongbu"],
  "Gangwon-do": ["Chuncheon", "Wonju", "Gangneung"],
  "Chungcheongbuk-do": ["Cheongju", "Chungju"],
  "Chungcheongnam-do": ["Cheonan", "Asan"],
  "Jeollabuk-do": ["Jeonju", "Iksan", "Gunsan"],
  "Jeollanam-do": ["Yeosu", "Suncheon", "Mokpo"],
  "Gyeongsangbuk-do": ["Pohang", "Gyeongju", "Gumi"],
  "Gyeongsangnam-do": ["Changwon", "Gimhae", "Jinju"],
  "Jeju-do": ["Jeju"],
};

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
  }
  parentInputs.forEach((input) => {
    input.addEventListener("change", update);
  });
  update();
}

setUp("category", "specialization", specializationsByCategory);
setUp("province", "city", citiesByProvince);
