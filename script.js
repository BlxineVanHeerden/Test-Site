const { jsPDF } = window.jspdf;

function $(id) {
  return document.getElementById(id);
}

/*
ITEM FORMAT (one per line):
Item name | qty | price
*/
function parseItems(raw) {
  return raw
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const parts = line.split("|").map(p => p.trim());
      if (parts.length !== 3) return null;

      const name = parts[0];
      const qty = Number(parts[1]);
      const price = Number(parts[2]);

      if (!name || isNaN(qty) || isNaN(price)) return null;

      return {
        name,
        qty,
        price,
        total: qty * price
      };
    })
    .filter(Boolean);
}

function generateInvoice() {
  const invoiceType = $("invoiceType").value;
  const yourName = $("yourName").value || "-";
  const clientName = $("clientName").value || "-";
  const taxRate = Number($("taxRate").value) || 0;

  const items = parseItems($("items").value);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  updateHealthScore(items, taxRate, clientName);
  renderBreakdown(subtotal, taxAmount, total);

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(invoiceType, 105, 20, null, null, "center");

  doc.setFontSize(12);
  doc.text(`From: ${yourName}`, 20, 40);
  doc.text(`To: ${clientName}`, 20, 50);

  let y = 70;
  items.forEach(item => {
    doc.text(
      `• ${item.name} (${item.qty} × $${item.price}) = $${item.total.toFixed(2)}`,
      20,
      y
    );
    y += 8;
  });

  y += 5;
  doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, y);
  doc.text(`Tax: $${taxAmount.toFixed(2)}`, 20, y + 10);
  doc.text(`Total: $${total.toFixed(2)}`, 20, y + 20);

  $("invoicePreview").src = doc.output("bloburl");
}

function updateHealthScore(items, taxRate, clientName) {
  let score = 100;
  let tips = [];

  if (clientName === "-") {
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

function markAsPaid() {
  alert("Invoice marked as paid ✔");
}
