// Back button
function goBack() {
  window.history.back();
}

// Navigation button clicks
document.querySelectorAll("nav button").forEach((btn) => {
  btn.addEventListener("click", () => {
    alert(`You clicked: ${btn.innerText}`);
  });
});
