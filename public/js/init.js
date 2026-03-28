import { showStep } from "./form/navButtons.js";
import { showReview } from "./form/reviewBuilder.js";
import "./form/contactOptions.js";
import "./form/locationOptions.js";

document.querySelector(".btn-last-next").addEventListener("click", showReview);
document
  .querySelector(".btn-back-to-review")
  .addEventListener("click", showReview);

if (document.querySelector("form").dataset.hasErrors !== undefined) {
  showStep(0);
  showReview();
} else {
  showStep(0);
}
