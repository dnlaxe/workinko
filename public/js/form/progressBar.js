const progressParts = Array.from(
  document.querySelectorAll("[data-progress-index]"),
);

export function updateProgress(index) {
  progressParts.forEach((part, i) => {
    part.classList.remove("bg-slate-200", "bg-[#41C3DD]", "bg-[#41C3DD]/60");

    if (i < index) {
      part.classList.add("bg-[#41C3DD]/60");
    } else if (i === index) {
      part.classList.add("bg-[#41C3DD]");
    } else {
      part.classList.add("bg-slate-200");
    }
  });

  const counter = document.querySelector(".step-counter");
  if (counter) {
    const step = Math.min(index + 1, progressParts.length);
    counter.textContent = `Step ${step} of ${progressParts.length}`;
  }
}
