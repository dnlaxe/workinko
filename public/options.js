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
  Seoul: [
    "Gangnam-gu",
    "Gangdong-gu",
    "Gangbuk-gu",
    "Gangseo-gu",
    "Gwanak-gu",
    "Gwangjin-gu",
    "Guro-gu",
    "Geumcheon-gu",
    "Nowon-gu",
    "Dobong-gu",
    "Dongdaemun-gu",
    "Dongjak-gu",
    "Mapo-gu",
    "Seodaemun-gu",
    "Seocho-gu",
    "Seongdong-gu",
    "Seongbuk-gu",
    "Songpa-gu",
    "Yangcheon-gu",
    "Yeongdeungpo-gu",
    "Yongsan-gu",
    "Eunpyeong-gu",
    "Jongno-gu",
    "Jung-gu",
    "Jungnang-gu",
  ],
  Busan: [
    "Jung-gu",
    "Seo-gu",
    "Dong-gu",
    "Yeongdo-gu",
    "Busanjin-gu",
    "Dongnae-gu",
    "Nam-gu",
    "Buk-gu",
    "Haeundae-gu",
    "Saha-gu",
    "Geumjeong-gu",
    "Gangseo-gu",
    "Yeonje-gu",
    "Suyeong-gu",
    "Sasang-gu",
    "Gijang-gun",
  ],
  Daegu: [
    "Jung-gu",
    "Dong-gu",
    "Seo-gu",
    "Nam-gu",
    "Buk-gu",
    "Suseong-gu",
    "Dalseo-gu",
    "Dalseong-gun",
    "Gunwi-gun",
  ],
  Incheon: [
    "Jung-gu",
    "Dong-gu",
    "Michuhol-gu",
    "Yeonsu-gu",
    "Namdong-gu",
    "Bupyeong-gu",
    "Gyeyang-gu",
    "Seo-gu",
    "Ganghwa-gun",
    "Ongjin-gun",
  ],
  Gwangju: ["Dong-gu", "Seo-gu", "Nam-gu", "Buk-gu", "Gwangsan-gu"],
  Daejeon: ["Dong-gu", "Jung-gu", "Seo-gu", "Yuseong-gu", "Daedeok-gu"],
  Ulsan: ["Jung-gu", "Nam-gu", "Dong-gu", "Buk-gu", "Ulju-gun"],
  Sejong: [
    "Hansol-dong",
    "Saerom-dong",
    "Naseong-dong",
    "Dodam-dong",
    "Eojin-dong",
    "Areum-dong",
    "Jongchon-dong",
    "Goun-dong",
    "Boram-dong",
    "Daepyeong-dong",
    "Sodam-dong",
    "Dajeong-dong",
    "Haemil-dong",
    "Bangok-dong",
    "Jochiwon-eup",
    "Yeongi-myeon",
    "Yeondong-myeon",
    "Bugang-myeon",
    "Geumnam-myeon",
    "Janggun-myeon",
    "Yeonseo-myeon",
    "Jeonui-myeon",
    "Jeondong-myeon",
    "Sojeong-myeon",
  ],
  "Gyeonggi-do": [
    "Suwon",
    "Seongnam",
    "Goyang",
    "Yongin",
    "Bucheon",
    "Ansan",
    "Anyang",
    "Namyangju",
    "Hwaseong",
    "Uijeongbu",
    "Pyeongtaek",
    "Siheung",
    "Paju",
    "Gimpo",
    "Gwangmyeong",
    "Gunpo",
    "Osan",
    "Icheon",
  ],
  "Gangwon-do": ["Chuncheon", "Wonju", "Gangneung", "Sokcho", "Donghae", "Samcheok"],
  "Chungcheongbuk-do": ["Cheongju", "Chungju", "Jecheon"],
  "Chungcheongnam-do": ["Cheonan", "Asan", "Seosan", "Dangjin", "Gongju", "Boryeong", "Nonsan"],
  "Jeollabuk-do": ["Jeonju", "Iksan", "Gunsan", "Jeongeup", "Namwon", "Gimje"],
  "Jeollanam-do": ["Yeosu", "Suncheon", "Mokpo", "Naju", "Gwangyang"],
  "Gyeongsangbuk-do": ["Pohang", "Gyeongju", "Gumi", "Andong", "Gyeongsan", "Yeongju", "Yeongcheon"],
  "Gyeongsangnam-do": ["Changwon", "Gimhae", "Jinju", "Yangsan", "Geoje", "Tongyeong", "Miryang", "Sacheon"],
  "Jeju-do": ["Jeju", "Seogwipo"],
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
