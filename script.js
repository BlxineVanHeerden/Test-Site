document.getElementById("invoiceDate").innerText =
  new Date().toLocaleDateString();

// ——— WORLD CURRENCY LIST ———
const allCurrencies = [
  { code:"USD", symbol:"$", flag:"🇺🇸", name:"US Dollar" },
  { code:"EUR", symbol:"€", flag:"🇪🇺", name:"Euro" },
  { code:"GBP", symbol:"£", flag:"🇬🇧", name:"British Pound" },
  { code:"JPY", symbol:"¥", flag:"🇯🇵", name:"Japanese Yen" },
  { code:"AUD", symbol:"$", flag:"🇦🇺", name:"Australian Dollar" },
  { code:"CAD", symbol:"$", flag:"🇨🇦", name:"Canadian Dollar" },
  { code:"CHF", symbol:"CHF", flag:"🇨🇭", name:"Swiss Franc" },
  { code:"CNY", symbol:"¥", flag:"🇨🇳", name:"Chinese Yuan" },
  { code:"INR", symbol:"₹", flag:"🇮🇳", name:"Indian Rupee" },
  { code:"BRL", symbol:"R$", flag:"🇧🇷", name:"Brazilian Real" },
  { code:"ZAR", symbol:"R", flag:"🇿🇦", name:"South African Rand" },
  { code:"NGN", symbol:"₦", flag:"🇳🇬", name:"Nigerian Naira" },
  { code:"MXN", symbol:"$", flag:"🇲🇽", name:"Mexican Peso" },
  { code:"RUB", symbol:"₽", flag:"🇷🇺", name:"Russian Ruble" },
  { code:"SGD", symbol:"$", flag:"🇸🇬", name:"Singapore Dollar" },
  { code:"SEK", symbol:"kr", flag:"🇸🇪", name:"Swedish Krona" },
  { code:"KRW", symbol:"₩", flag:"🇰🇷", name:"South Korean Won" },
  { code:"TRY", symbol:"₺", flag:"🇹🇷", name:"Turkish Lira" },
  { code:"PLN", symbol:"zł", flag:"🇵🇱", name:"Polish Zloty" },
  { code:"NOK", symbol:"kr", flag:"🇳🇴", name:"Norwegian Krone" },
  { code:"AED", symbol:"د.إ", flag:"🇦🇪", name:"UAE Dirham" }
  // — Add more as needed (using ISO 4217 list) :contentReference[oaicite:4]{index=4}  
];

// — Selected currency state
let currency = allCurrencies[0];

// Populate dropdown
const sel = document.getElementById("currencySelect");
allCurrencies.forEach(c => {
  const o = document.createElement("option");
  o.value = c.code;
  o.textContent = `${c.flag} ${c.code} – ${c.name}`;
  sel.appendChild(o);
});

// Change currency handler
sel.addEventListener("change", e => {
  const c = allCurrencies.find(x => x.code === e.target.value);
  if (!c) return;
  currency = c;
  updateCurrencyPreview();
  recalc();
});

function updateCurrencyPreview() {
  document.getElementById("currencyPreview").innerHTML =
    `<span class="currency-flag">${currency.flag}</span>
     ${currency.code} — ${currency.name}`;
}

// Initial preview
updateCurrencyPreview();

// … (leave your existing functions: addRow, removeRow, recalc, updateScores, toggleClientView)

// In recalc(), use currency.symbol instead of hardcoded $
function recalc() {
  let subtotal = 0;
  document.querySelectorAll("#itemsBody tr").forEach(r => {
    const qty = Number(r.children[2].querySelector("input").value) || 0;
    const price = Number(r.children[3].querySelector("input").value) || 0;
    const total = qty * price;
    r.querySelector(".lineTotal").textContent =
      `${currency.symbol}${total.toFixed(2)}`;
    subtotal += total;
  });
  const tax = subtotal * (Number(taxRate.value) / 100);
  const total = subtotal + tax;

  subtotalEl.textContent = `${currency.symbol}${subtotal.toFixed(2)}`;
  taxAmount.textContent = `${currency.symbol}${tax.toFixed(2)}`;
  grandTotal.textContent = `${currency.symbol}${total.toFixed(2)}`;

  updateScores(subtotal, 0, document.querySelectorAll("#itemsBody tr").length);
}

// In generateInvoice(), use currency for PDF too
function generateInvoice() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("INVOICE", 20, 20);
  doc.setFontSize(11);
  doc.text(`Currency: ${currency.flag} ${currency.code}`, 150, 20);

  // … rest of PDF rows same as before, using currency.symbol

  invoicePreview.src = doc.output("datauristring");
}

recalc();
