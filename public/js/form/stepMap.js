export const steps = Array.from(document.querySelectorAll(".step"));
export const nameToStep = {};

steps.forEach((step, i) => {
  step.querySelectorAll("[name]").forEach((input) => {
    nameToStep[input.name] = i;
  });
});

// cache
// {
//   contactMethod: 0,
//   contactUrl: 0,
//   category: 1,
//   specialization: 1,
//   province: 2,
//   city: 2,
//   koreanProficiency: 3,
//   englishProficiency: 3,
//   otherLanguages: 3,
//   contractType: 4,
//   visaSponsorship: 4,
//   startDate: 5,
//   heading: 6,
//   subheading: 6,
//   fullDescription: 6,
// }
