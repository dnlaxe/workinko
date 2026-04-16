const checkoutSubmit = document.querySelector("[data-checkout-submit]");

function updateBill() {
  const selectedRadios = Array.from(
    document.querySelectorAll("input[type=radio]:checked"),
  );
  let total = selectedRadios.reduce(
    (acc, radio) => (radio.value === "pinned" ? acc + 10 : acc),
    0,
  );
  if (checkoutSubmit) {
    checkoutSubmit.textContent = `Pay and submit ($${total})`;
  }
}

const radioInputs = document.querySelectorAll("input[type=radio]");

radioInputs.forEach((input) => {
  input.addEventListener("change", updateBill);
});

updateBill();
