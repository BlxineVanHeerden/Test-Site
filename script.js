const { jsPDF } = window.jspdf;

// Global invoice counter
let invoiceCounter = 1;

// Wait for DOM
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("previewBtn").addEventListener("click", generateInvoice);
  document.getElementById("toggleBreakdownBtn").addEventListener("click", toggleBreakdown);
  document.getElementById("markPaidBtn").addEventListener("click", markAsPaid);
});

// Helper to get element
function $(id) {
  return document.getElementById(id);
}

// Parse items safely
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

// Generate invoice PDF
function generateInvoice() {
  const yourName = $("yourName").value || "-";
  const yourEmail = $("yourEmail").value || "-";
  const clientName = $("clientName").value || "-";
  const clientEmail = $("clientEmail").value || "-";
  const items = parseItems($("items").value);
  const taxRate = Number($("taxRate").value) || 0;

  if (!yourName || !clientName || items.length === 0) {
    alert("Please fill in required fields.");
    return;
  }

  // Auto invoice number + date
  const invoiceNumber = invoiceCounter++;
  const invoiceDate = new Date().toLocaleDateString();
  $("invoiceNumber").innerText = invoiceNumber;
  $("invoiceDate").innerText = invoiceDate;

  // Subtotal, tax, total
  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  updateHealthScore(items, taxRate, clientName);
  renderBreakdown(subtotal, taxAmount, total);

  // PDF generation
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Invoice", 105, 20, null, null, "center");

  doc.setFontSize(12);
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

// Health score
function updateHealthScore(items, taxRate, clientName) {
  let score = 100;
  let tips = [];

  if (!clientName || clientName === "-") {
    score -= 20;
    tips.push("Add client details");
  }
  if (items.length === 0) {
    score -= 30;
    tips.push("Add at least one item");
  }
  if (taxRate === 0) {
    score -= 10;
    tips.push("Consider adding tax");
  }

  $("healthScore").innerText = `${score}/100`;
  $("healthTips").innerHTML = tips.map(t => `⚠️ ${t}`).join("<br>");
}

// Breakdown toggle
function renderBreakdown(subtotal, tax, total) {
  $("breakdown").innerHTML = `
    <p>Subtotal: $${subtotal.toFixed(2)}</p>
    <p>Tax: $${tax.toFixed(2)}</p>
    <strong>Total: $${total.toFixed(2)}</strong>
  `;
}

function toggleBreakdown() {
  $("breakdown").classList.toggle("hidden");
}

// Mark as paid
function markAsPaid() {
  alert("Invoice marked as paid ✔");
}
