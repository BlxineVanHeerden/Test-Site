document.getElementById("invoiceDate").innerText =
  new Date().toLocaleDateString();

document.addEventListener("input", recalc);

function addRow() {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input value="Phase"></td>
    <td><input></td>
    <td><input type="number" value="1"></td>
    <td><input type="number" value="0"></td>
    <td class="lineTotal">$0.00</td>
    <td><button onclick="removeRow(this)">✕</button></td>
  `;
  itemsBody.appendChild(row);
}

function removeRow(btn) {
  btn.closest("tr").remove();
  recalc();
}

function recalc() {
  let subtotal = 0;
  let vagueCount = 0;
  let rows = [...document.querySelectorAll("#itemsBody tr")];

  rows.forEach(r => {
    const name = r.children[1].querySelector("input").value.toLowerCase();
    const qty = +r.children[2].querySelector("input").value || 0;
    const price = +r.children[3].querySelector("input").value || 0;
    const total = qty * price;
    r.querySelector(".lineTotal").innerText = `$${total.toFixed(2)}`;
    subtotal += total;
    if (name.length < 5) vagueCount++;
  });

  const tax = subtotal * (+taxRate.value / 100);
  const total = subtotal + tax;

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  taxAmount.textContent = `$${tax.toFixed(2)}`;
  grandTotal.textContent = `$${total.toFixed(2)}`;

  updateScores(subtotal, vagueCount, rows.length);
}

function updateScores(subtotal, vague, count) {
  let health = 100, friction = 100, readability = 100, dispute = 100;
  let tips = [];

  if (!clientName.value) { health -= 20; dispute -= 20; tips.push("Add client info"); }
  if (subtotal <= 0) { health -= 40; tips.push("Invoice total is zero"); }
  if (taxRate.value == 0) friction -= 10;
  if (count > 6) readability -= 15;
  if (vague > 0) { dispute -= vague * 10; tips.push("Clarify vague items"); }

  showScore("healthScore", health);
  showScore("frictionScore", friction);
  showScore("readabilityScore", readability);
  showScore("disputeScore", dispute);

  tipsEl.innerHTML = tips.map(t => "• " + t).join("<br>");
}

function showScore(id, val) {
  const el = document.getElementById(id);
  el.textContent = val + "/100";
  el.className = "score " + (val >= 80 ? "good" : val >= 50 ? "warn" : "bad");
}

function toggleClientView() {
  document.body.classList.toggle("clientView");
}

function generateInvoice() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("INVOICE", 20, 20);

  doc.setFontSize(11);
  doc.text(`From: ${yourName.value}`, 20, 35);
  doc.text(`To: ${clientName.value}`, 20, 45);

  const rows = [];
  document.querySelectorAll("#itemsBody tr").forEach(r => {
    rows.push([
      r.children[0].querySelector("input").value,
      r.children[1].querySelector("input").value,
      r.children[2].querySelector("input").value,
      `$${r.children[3].querySelector("input").value}`,
      r.querySelector(".lineTotal").innerText
    ]);
  });

  doc.autoTable({
    startY: 60,
    head: [["Phase","Item","Qty","Price","Total"]],
    body: rows
  });

  const y = doc.lastAutoTable.finalY + 10;
  doc.text(`Total: ${grandTotal.textContent}`, 150, y);

  invoicePreview.src = doc.output("datauristring");
}

const subtotalEl = document.getElementById("subtotal");
const taxAmount = document.getElementById("taxAmount");
const grandTotal = document.getElementById("grandTotal");
const tipsEl = document.getElementById("tips");

recalc();
