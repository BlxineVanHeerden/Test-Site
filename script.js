async function generateAd() {
  const business = document.getElementById("business").value;
  if (!business) {
    alert("Please enter your business or product!");
    return;
  }

  document.getElementById("adResult").innerText = "Generating ad...";

  try {
    const response = await fetch("/api/generate", {  // must match the file name
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business })
    });

    const data = await response.json();
    document.getElementById("adResult").innerText = data.ad;
  } catch (err) {
    console.error(err);
    document.getElementById("adResult").innerText = "Error generating ad";
  }
}
