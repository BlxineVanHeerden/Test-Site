const { jsPDF } = window.jspdf;

function $(id) {
  return document.getElementById(id);
}

// ✅ MULTI-LINE ITEM PARSER
function parseItems(raw) {
  if (!raw.trim()) return [];

  return raw.split("\n").map(line => {
    const parts = line.split("|").map(p => p.trim());
    if (parts.length !== 3) return null;

    const [name, qty, price] = parts;
    return {
      name,
      qty: Number(qty) || 1,
      price: Number(price) || 0,
      total: (Number(qty) || 1) * (Number(price) || 0)
    };
  }).filter(Boolean);
}

function generateInvoice() {
  const invoiceType = $("invoiceType").value;
  const yourName = $("yourName").value;
  const clientName = $("clientName").value;
  const items = parseItems($("items").value);
  const taxRate = Number($("taxRate").value) || 0;

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  updateHealthScore(items, taxRate, clientName);
  renderBreakdown(subtotal, taxAmount, total);

  // PDF
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(invoiceType, 105, 20, null, null, "center");

  doc.setFontSize(12);
  doc.text(`From: ${yourName || "-"}`, 20, 40);
  doc.text(`To: ${clientName || "-"}`, 20, 50);

  let y = 70;
  items.forEach(item => {
    doc.text(
      `• ${item.name} (${item.qty} × $${item.price}) = $${item.total.toFixed(2)}`,
      20,
      y
    );
    y += 8;
  });

  doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, y + 10);
  doc.text(`Tax: $${taxAmount.toFixed(2)}`, 20, y + 20);
  doc.text(`Total: $${total.toFixed(2)}`, 20, y + 30);

  $("invoicePreview").src = doc.output("bloburl");
}

// ✅ HEALTH SCORE
function updateHealthScore(items, tax, client) {
  let score = 100;
  let tips = [];

  if (!client) {
    score -= 20;
    tips.push("Add client details");
  }
  if (items.length === 0) {
    score -= 30;
    tips.push("Add at least one invoice item");
  }
  if (tax === 0) {
    score -= 10;
    tips.push("Consider adding tax");
  }

  $("healthScore").innerText = `${score}/100`;
  $("healthTips").innerHTML = tips.map(t => `⚠️ ${t}`).join("<br>");
}

// ✅ BREAKDOWN
function renderBreakdown(sub, tax, total) {
  $("breakdown").innerHTML = `
    <p>Subtotal: $${sub.toFixed(2)}</p>
    <p>Tax: $${tax.toFixed(2)}</p>
    <strong>Total: $${total.toFixed(2)}</strong>
  `;
}

function toggleBreakdown() {
  $("breakdown").classList.toggle("hidden");
}

// ✅ MARK AS PAID
function markAsPaid() {
  const client = $("clientName").value;
  if (!client) {
    alert("Add client name first");
    return;
  }
  alert("Invoice marked as paid ✔");
}
