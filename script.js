const { jsPDF } = window.jspdf;

let history = JSON.parse(localStorage.getItem("itemHistory") || "[]");
let clientStats = JSON.parse(localStorage.getItem("clientStats") || "{}");

function parseItems(raw) {
  return raw.split(",").map(i => {
    const [name, rest] = i.split(":");
    const [qty, price] = rest.split("x");
    return {
      name: name.trim(),
      qty: Number(qty),
      price: Number(price),
      total: Number(qty) * Number(price)
    };
  });
}

function generateInvoice() {
  const type = invoiceType.value;
  const yourName = yourNameInput();
  const client = clientName.value;
  const items = parseItems(itemsInput());
  const tax = Number(taxRate.value);

  saveItemHistory(items);
  updateHealthScore(items, tax, client);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = subtotal * (tax / 100);
  const total = subtotal + taxAmount;

  renderBreakdown(subtotal, taxAmount, total);

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(type, 105, 20, null, null, "center");

  doc.setFontSize(12);
  doc.text(`From: ${yourName}`, 20, 40);
  doc.text(`To: ${client}`, 20, 50);

  let y = 70;
  items.forEach(i => {
    doc.text(`${i.name} (${i.qty} × $${i.price}) = $${i.total}`, 20, y);
    y += 10;
  });

  doc.text(`Subtotal: $${subtotal}`, 20, y + 10);
  doc.text(`Tax: $${taxAmount}`, 20, y + 20);
  doc.text(`Total: $${total}`, 20, y + 30);

  invoicePreview.src = doc.output("bloburl");
}

function saveItemHistory(items) {
  items.forEach(i => history.push(i.name));
  localStorage.setItem("itemHistory", JSON.stringify(history.slice(-50)));
}

function updateHealthScore(items, tax, client) {
  let score = 100;
  let tips = [];

  if (!tax) { score -= 10; tips.push("Add tax rate"); }
  if (items.length < 1) { score -= 20; tips.push("Add items"); }
  if (!client) { score -= 20; tips.push("Add client info"); }

  healthScore.innerText = score + "/100";
  healthTips.innerHTML = tips.map(t => "⚠️ " + t).join("<br>");
}

function renderBreakdown(sub, tax, total) {
  breakdown.innerHTML = `
    Subtotal: $${sub}<br>
    Tax: $${tax}<br>
    <strong>Total: $${total}</strong>
  `;
}

function toggleBreakdown() {
  breakdown.classList.toggle("hidden");
}

function markAsPaid() {
  const client = clientName.value;
  if (!client) return;

  clientStats[client] = clientStats[client] || [];
  clientStats[client].push(Date.now());

  localStorage.setItem("clientStats", JSON.stringify(clientStats));
  alert("Invoice marked as paid");
}

function yourNameInput() {
  return document.getElementById("yourName").value;
}
function itemsInput() {
  return document.getElementById("items").value;
}
