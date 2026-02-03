let logoDataUrl = null;

// Logo upload handling
$("logoUpload")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    logoDataUrl = event.target.result; // store base64 image
    generateInvoice(); // refresh PDF with logo
  };
  reader.readAsDataURL(file);
});

// In generateInvoice()
function generateInvoice() {
  const yourName = $("yourName").value || "-";
  const yourEmail = $("yourEmail").value || "-";
  const clientName = $("clientName").value || "-";
  const clientEmail = $("clientEmail").value || "-";
  const items = parseItems($("items").value);
  const taxRate = Number($("taxRate").value) || 0;
  const template = $("templateSelect").value;

  if (!yourName || !clientName || items.length === 0) {
    alert("Please fill in required fields.");
    return;
  }

  const invoiceNumber = invoiceCounter++;
  const invoiceDate = new Date().toLocaleDateString();
  $("invoiceNumber").innerText = invoiceNumber;
  $("invoiceDate").innerText = invoiceDate;

  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  updateHealthScore(items, taxRate, clientName);
  renderBreakdown(subtotal, taxAmount, total);

  const doc = new jsPDF();

  // Template-specific styles
  if (template === "classic") {
    doc.setFont("times", "normal");
    doc.setFontSize(18);
    doc.text("Invoice", 105, 20, null, null, "center");
  } else if (template === "modern") {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(50, 50, 150);
    doc.text("INVOICE", 105, 25, null, null, "center");
  } else if (template === "minimal") {
    doc.setFont("courier", "normal");
    doc.setFontSize(16);
    doc.text("Invoice", 20, 20);
  }

  // Add logo if uploaded
  if (logoDataUrl) {
    // position: x=150, y=10, width=40, auto-height
    doc.addImage(logoDataUrl, "PNG", 150, 10, 40, 0);
  }

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice #: ${invoiceNumber}`, 20, 40);
  doc.text(`Date: ${invoiceDate}`, 140, 40);
  doc.text(`From: ${yourName} (${yourEmail})`, 20, 50);
  doc.text(`To: ${clientName} (${clientEmail})`, 20, 60);

  let y = 80;
  items.forEach(item => {
    doc.text(`• ${item.name} - $${item.price.toFixed(2)}`, 20, y);
    y += 8;
  });

  y += 5;
  doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, y);
  doc.text(`Tax: $${taxAmount.toFixed(2)}`, 20, y + 10);
  doc.text(`Total: $${total.toFixed(2)}`, 20, y + 20);

  $("invoicePreview").src = doc.output("bloburl");
}
