export const jobFormOptions = {
  category: ["Teaching", "Non-teaching"],
  specialization: ["Frontend", "Backend"],
  contractType: ["Full-time", "Part-time"],
  province: ["Seoul", "Gyeonggi-do", "Incheon"],
  city: ["Seoul", "Suwon", "Seongnam", "Incheon"],

  koreanProficiency: [
    { value: 0, label: "Not Required" },
    { value: 1, label: "Beginner" },
    { value: 2, label: "Intermediate" },
  ],
  englishProficiency: [
    { value: 0, label: "Not Required" },
    { value: 1, label: "Beginner" },
    { value: 2, label: "Intermediate" },
  ],
  visaSponsorship: ["Not Provided", "Provided"],
  startDate: ["ASAP", "Spring", "March"],
  contactMethod: ["link", "relay"],
} as const;
