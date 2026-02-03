const { jsPDF } = window.jspdf;

function generateInvoice() {
  const yourName = document.getElementById("yourName").value;
  const yourEmail = document.getElementById("yourEmail").value;
  const clientName = document.getElementById("clientName").value;
  const clientEmail = document.getElementById("clientEmail").value;
  const itemsRaw = document.getElementById("items").value;

  if (!yourName || !clientName || !itemsRaw) {
    alert("Please fill out all required fields!");
    return;
  }

  const items = itemsRaw.split(",").map(i => {
    const [desc, price] = i.split(":");
    return { desc: desc.trim(), price: parseFloat(price) || 0 };
  });

  let total = items.reduce((sum, item) => sum + item.price, 0);

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Invoice", 105, 20, null, null, "center");
  
  doc.setFontSize(12);
  doc.text(`From: ${yourName} (${yourEmail})`, 20, 40);
  doc.text(`To: ${clientName} (${clientEmail})`, 20, 50);

  doc.text("Items:", 20, 70);
  let y = 80;
  items.forEach(item => {
    doc.text(`${item.desc} - $${item.price.toFixed(2)}`, 25, y);
    y += 10;
  });

  doc.text(`Total: $${total.toFixed(2)}`, 20, y + 10);

  // Preview in iframe
  const pdfData = doc.output("bloburl");
  document.getElementById("invoicePreview").src = pdfData;

  // Optional: automatically save PDF (can be used for paywall later)
  // doc.save("invoice.pdf");
}

// Optional: PayPal button integration (sandbox mode)
if (window.paypal) {
  paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: { value: '5.00' } // price per invoice
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        alert('Payment complete! You can now download the invoice.');
        generateInvoice(); // Generate PDF after payment
      });
    }
  }).render('#paypal-button-container');
}
