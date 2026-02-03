const { jsPDF } = window.jspdf;
let invoiceCounter = 1;
let isPaid = false;

// Helper
function $(id) { return document.getElementById(id); }

// Parse items from textarea: "Item | Qty | Price"
function parseItems(raw) {
  return raw
    .split("\n")
    .map(line => line.trim())
    .filter(line => line !== "")
    .map(line => {
      const parts = line.split("|").map(p => p.trim());
      if (parts.length !== 3) return null;
      const name = parts[0];
      const qty = Number(parts[1]);
      const price = Number(parts[2]);
      if (!name || isNaN(qty) || isNaN(price)) return null;
      return { name, qty, price, total: qty * price };
    })
    .filter(Boolean);
}

// Update health score
function updateHealthScore(items, taxRate, clientName) {
  let score = 100;
  let tips = [];

  if (!clientName) { score -= 20; tips.push("Add client details"); }
  if (items.length === 0) { score -= 30; tips.push("Add at least one item"); }
  if (taxRate === 0) { score -= 10; tips.push("Consider adding tax"); }

  $("healthScore").innerText = `${score}/100`;
  $("healthTips").innerHTML = tips.map(t => `⚠️ ${t}`).join("<br>");

  // Color
  if (score >= 80) $("healthScore").style.color = "green";
  else if (score >= 50) $("healthScore").style.color = "orange";
  else $("healthScore").style.color = "red";
}

// Render breakdown
function renderBreakdown(subtotal, tax, discount, total) {
  $("breakdown").innerHTML = `
    <p>Subtotal: $${subtotal.toFixed(2)}</p>
    <p>Tax: $${tax.toFixed(2)}</p>
    <p>Discount: $${discount.toFixed(2)}</p>
    <strong>Total: $${total.toFixed(2)}</strong>
  `;
}

// Generate PDF
function generateInvoice(download = false) {
  const yourName = $("yourName").value || "-";
  const yourEmail = $("yourEmail").value || "-";
  const clientName = $("clientName").value || "-";
  const clientEmail = $("clientEmail").value || "-";
  const items = parseItems($("items").value);
  const taxRate = Number($("taxRate").value) || 0;
  const discount = Number($("discount").value) || 0;
  const notes = $("notes").value || "";
  const template = $("templateSelect").value;

  if (!yourName || !clientName || items.length === 0) {
    alert("Please fill in required fields.");
    return;
  }

  const invoiceNumber = invoiceCounter++;
  const invoiceDate = new Date().toLocaleDateString();
  $("invoiceNumber").innerText = invoiceNumber;
  $("invoiceDate").innerText = invoiceDate;

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discount;

  updateHealthScore(items, taxRate, clientName);
  renderBreakdown(subtotal, taxAmount, discount, total);

  const doc = new jsPDF();

  // Template header
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

  let y = 40;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`From: ${yourName} (${yourEmail})`, 20, y);
  doc.text(`To: ${clientName} (${clientEmail})`, 20, y + 10);

  doc.text(`Invoice #: ${invoiceNumber}`, 140, 20);
  doc.text(`Date: ${invoiceDate}`, 140, 30);

  y += 30;

  // Items Table
  doc.autoTable({
    startY: y,
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: items.map(i => [i.name, i.qty, `$${i.price.toFixed(2)}`, `$${i.total.toFixed(2)}`]),
  });

  const tableEndY = doc.lastAutoTable.finalY || y;

  // Totals
  doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 140, tableEndY + 10);
  doc.text(`Tax: $${taxAmount.toFixed(2)}`, 140, tableEndY + 20);
  doc.text(`Discount: $${discount.toFixed(2)}`, 140, tableEndY + 30);
  doc.text(`Total: $${total.toFixed(2)}`, 140, tableEndY + 40);

  if (notes) {
    doc.text("Notes:", 20, tableEndY + 50);
    doc.text(notes, 20, tableEndY + 60);
  }

  // PAID Stamp
  if (isPaid) {
    doc.setTextColor(0, 150, 0);
    doc.setFontSize(40);
    doc.text("PAID", 60, tableEndY / 2, null, null, "center");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
  }

  const blobUrl = doc.output("bloburl");
  $("invoicePreview").src = blobUrl;

  if (download) doc.save(`Invoice_${invoiceNumber}.pdf`);
}

// Toggle breakdown
function toggleBreakdown() {
  $("breakdown").classList.toggle("hidden");
}

// Mark as paid
function markAsPaid() {
  isPaid = true;
  alert("Invoice marked as PAID ✔");
  generateInvoice();
}

// Event listeners
window.addEventListener("DOMContentLoaded", () => {
  $("previewBtn").addEventListener("click", () => generateInvoice());
  $("toggleBreakdownBtn").addEventListener("click", toggleBreakdown);
  $("markPaidBtn").addEventListener("click", markAsPaid);
  $("downloadBtn").addEventListener("click", () => generateInvoice(true));
});
