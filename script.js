async function generateAd() {
  const business = document.getElementById("business").value;
  if (!business) {
    alert("Please enter your business or product!");
    return;
  }

  // Show loading message
  document.getElementById("adResult").innerText = "Generating ad...";

  try {
    // Call OpenAI API
    const response = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business })
    });

    const data = await response.json();
    document.getElementById("adResult").innerText = data.ad;
  } catch (err) {
    document.getElementById("adResult").innerText = "Error generating ad. Try again.";
    console.error(err);
  }
}

// PayPal button
paypal.Buttons({
  createOrder: function(data, actions) {
    return actions.order.create({
      purchase_units: [{
        amount: { value: '1.00' } // $1 to generate ad
      }]
    });
  },
  onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
      alert('Payment completed! You can now generate your ad.');
    });
  }
}).render('#paypal-button-container');