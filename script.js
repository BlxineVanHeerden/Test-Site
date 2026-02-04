document.getElementById("invoiceDate").innerText =
  new Date().toLocaleDateString();

let currency = {
  code: "USD",
  symbol: "$",
  flag: "🇺🇸",
  rate: 1
};

document.addEventListener("input", recalc);

// Currency change
currencySelect.addEventListener("change", e => {
  const opt = e.target.selectedOptions[0];
  currency.code = opt.value;
  currency.symbol = opt.dataset.symbol;
  currency.flag = opt.dataset.flag;
  currency.rate = Number(opt.dataset.rate);

  currencyFlag.textContent = currency.flag;
  currencyCode.textContent = currency.code;

  updateCurrencyHints();
  recalc();
});

// Auto-detect currency from client email
clientEmail.addEventListener("blur", () => {
  const email = clientEmail.value.toLowerCase();
  if (email.endsWith(".uk")) currencySelect.value = "GBP";
  else if (email.endsWith(".eu")) currencySelect.value = "EUR";
  else if (email.endsWith(".ng")) currencySelect.value = "NGN";
  else return;

  currencySelect.dispatchEvent(new Event("change"));
});

function updateCurrencyHints() {
  exchangePreview.textContent =
    `Approx USD equivalent shown for reference only`;

  const taxTips = {
    USD: "Sales tax varies by state (usually excluded on invoices).",
    EUR: "VAT is commonly required for EU invoices.",
    GBP: "VAT applies if registered in the UK.",
    NGN: "VAT (7.5%) may apply in Nigeria."
  };

  taxHint.textContent = taxTips[currency.code] || "";
}

function addRow() {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input></td>
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
  let vague = 0;
  const rows = [...itemsBody.querySelectorAll("tr")];

  rows.forEach(r => {
    const name = r.children[1].querySelector("input").value;
    const qty = +r.children[2].querySelector("input").value || 0;
    const price = +r.children[3].querySelector("input").value || 0;
    const total = qty * price;
    r.querySelector(".lineTotal").textContent =
      `${currency.symbol}${total.toFixed(2)}`;
    subtotal += total;
    if (name.length < 5) vague++;
  });

  const tax = subtotal * (+taxRate.value / 100);
  const total = subtotal + tax;

  subtotal.textContent = `${currency.symbol}${subtotal.toFixed(2)}`;
  taxAmount.textContent = `${currency.symbol}${tax.toFixed(2)}`;
  grandTotal.textContent = `${currency.symbol}${total.toFixed(2)}`;

  updateScores(subtotal, vague, rows.length);
}

function updateScores(subtotal, vague, count) {
  let health = 100, friction = 100, readability = 100, dispute = 100;
  let tips = [];

  if (!clientName.value) { health -= 20; dispute -= 20; tips.push("Add client info"); }
  if (subtotal <= 0) { health -= 40; tips.push("Invoice total is zero"); }
  if (taxRate.value == 0) friction -= 10;
  if (count > 6) readability -= 15;
  if (vague > 0) dispute -= vague * 10;

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
  doc.text(`Currency: ${currency.code} ${currency.flag}`, 150, 35);

  const rows = [];
  itemsBody.querySelectorAll("tr").forEach(r => {
    rows.push([
      r.children[0].querySelector("input").value,
      r.children[1].querySelector("input").value,
      r.children[2].querySelector("input").value,
      `${currency.symbol}${r.children[3].querySelector("input").value}`,
      r.querySelector(".lineTotal").textContent
    ]);
  });

  doc.autoTable({
    startY: 60,
    head: [["Phase","Item","Qty","Price","Total"]],
    body: rows
  });

  doc.text(`Total: ${grandTotal.textContent}`, 150, doc.lastAutoTable.finalY + 10);

  invoicePreview.src = doc.output("datauristring");
}

const tipsEl = document.getElementById("tips");
updateCurrencyHints();
recalc();
