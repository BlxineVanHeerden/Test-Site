const { jsPDF } = window.jspdf;
let invoiceCounter = 1;
let logoDataUrl = null;

// Helper to get element
function $(id) { return document.getElementById(id); }

// Parse items (line by line, "Item - Price")
function parseItems(raw) {
  return raw
    .split("\n")
    .map(line => line.trim())
    .filter(line => line !== "")
    .map(line => {
      const parts = line.split("-");
      if (parts.length !== 2) return null;
      const name = parts[0].trim();
      const price = Number(parts[1].trim());
      if (!name || isNaN(price)) return null;
      return { name, price };
    })
    .filter(Boolean);
}

// Generate PDF Invoice
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

  // Invoice number & date
  const invoiceNumber = invoiceCounter++;
  const invoiceDate = new Date().toLocaleDateString();
  $("invoiceNumber").innerText = invoiceNumber;
  $("invoiceDate").innerText = invoiceDate;

  // Calculate totals
  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  // Update health & breakdown
  updateHealthScore(items, taxRate, clientName);
  renderBreakdown(subtotal, taxAmount, total);

  const doc = new jsPDF();

  // Templates
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

  // Logo top-left
  if (logoDataUrl) {
    const maxWidth = 50;
    const maxHeight = 30;
    const x = 20;
    const y = 10;
    doc.addImage(logoDataUrl, "PNG", x, y, maxWidth, maxHeight);
  }

  // Your info below logo
  let yourInfoY = 10 + 30 + 5; // top + logo height + padding
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`From: ${yourName} (${yourEmail})`, 20, yourInfoY);
  doc.text(`To: ${clientName} (${clientEmail})`, 20, yourInfoY + 10);

  // Invoice number & date top-right
  doc.text(`Invoice #: ${invoiceNumber}`, 140, 20);
  doc.text(`Date: ${invoiceDate}`, 140, 30);

  // Items list
  let y = yourInfoY + 30;
  items.forEach(item => {
    doc.text(`• ${item.name} - $${item.price.toFixed(2)}`, 20, y);
    y += 8;
  });

  y += 5;
  doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, y);
  doc.text(`Tax: $${taxAmount.toFixed(2)}`, 20, y + 10);
  doc.text(`Total: $${total.toFixed(2)}`, 20, y + 20);

  // Show in iframe
  $("invoicePreview").src = doc.output("bloburl");
}

// Update health score
function updateHealthScore(items, taxRate, clientName) {
  let score = 100;
  let tips = [];
  if (!clientName || clientName === "-") { score -= 20; tips.push("Add client details"); }
  if (items.length === 0) { score -= 30; tips.push("Add at least one item"); }
  if (taxRate === 0) { score -= 10; tips.push("Consider adding tax"); }

  $("healthScore").innerText = `${score}/100`;
  $("healthTips").innerHTML = tips.map(t => `⚠️ ${t}`).join("<br>");
}

// Render breakdown section
function renderBreakdown(subtotal, tax, total) {
  $("breakdown").innerHTML = `
    <p>Subtotal: $${subtotal.toFixed(2)}</p>
    <p>Tax: $${tax.toFixed(2)}</p>
    <strong>Total: $${total.toFixed(2)}</strong>
  `;
}

// Toggle breakdown visibility
function toggleBreakdown() {
  $("breakdown").classList.toggle("hidden");
}

// Mark invoice as paid
function markAsPaid() {
  alert("Invoice marked as paid ✔");
}

// Event listeners after DOM loads
window.addEventListener("DOMContentLoaded", () => {
  $("previewBtn").addEventListener("click", generateInvoice);
  $("toggleBreakdownBtn").addEventListener("click", toggleBreakdown);
  $("markPaidBtn").addEventListener("click", markAsPaid);

  $("logoUpload").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
      logoDataUrl = event.target.result;
      generateInvoice(); // auto refresh preview
    };
    reader.readAsDataURL(file);
  });
});
