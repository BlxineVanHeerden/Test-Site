document.getElementById("policyForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    siteName: document.getElementById("siteName").value,
    country: document.getElementById("country").value,
    collectEmail: document.getElementById("collectEmail").checked
  };

  const policyText = generatePrivacyPolicy(data);

  document.getElementById("policyText").textContent = policyText;
  document.getElementById("output").classList.remove("hidden");
});
