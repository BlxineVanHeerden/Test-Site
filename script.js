// ---------- INIT ----------
document.getElementById("invoiceDate").textContent =
  new Date().toLocaleDateString();

const currencySelect = document.getElementById("currencySelect");
const currencyInfo = document.getElementById("currencyInfo");

const subtotalDisplay = document.getElementById("subtotalDisplay");
const taxDisplay = document.getElementById("taxDisplay");
const totalDisplay = document.getElementById("totalDisplay");

const itemsBody = document.getElementById("itemsBody");

const pdfBtn = document.getElementById("pdfBtn");

// ---------- PLAN / FEATURE LOCK ----------
let selectedPlan = "free";      // unlocked plan (paid)
let intendedPlan = "free";      // plan user clicked but not paid yet

const planCards = document.querySelectorAll(".plan-card");

planCards.forEach(card => {
  card.addEventListener("click", () => {
    const plan = card.getAttribute("data-plan");
    intendedPlan = plan;

    planCards.forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    if (plan === "free") {
      selectedPlan = "free";
      updateFeatureAccess();
    } else {
      alert(`The ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan requires payment to unlock features.`);
      updateFeatureAccess(); // keep current unlocked features
    }
  });
});

function updateFeatureAccess() {
  // Lock everything first
  pdfBtn.disabled = true;
  pdfBtn.classList.remove("unlocked");

  if (selectedPlan === "free") {
    pdfBtn.disabled = true; // PDF download locked in free plan
  } else if (selectedPlan === "basic") {
    pdfBtn.disabled = false;
    pdfBtn.classList.add("unlocked");
  } else if (selectedPlan === "pro") {
    pdfBtn.disabled = false;
    pdfBtn.classList.add("unlocked");
  }
}

updateFeatureAccess();

// ---------- PAYPAL INTEGRATION ----------
function setupPaypalButton(containerId, plan, amount) {
  paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{ amount: { value: amount.toString() } }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(details => {
        alert(`Payment completed by ${details.payer.name.given_name}. ${plan} Plan unlocked!`);
        selectedPlan = intendedPlan;
        planCards.forEach(c => c.classList.remove("selected"));
        document.querySelector(`.plan-card[data-plan="${selectedPlan}"]`).classList.add("selected");
        updateFeatureAccess();
      });
    },
    onError: function(err) {
      console.error(err);
      alert("Payment could not be processed.");
    }
  }).render(`#${containerId}`);
}

// Replace with your PayPal container IDs and amounts
setupPaypalButton("paypal-basic", "basic", 5);
setupPaypalButton("paypal-pro", "pro", 10);

// ---------- CURRENCIES ----------
const currencies = [
  { code:"USD", symbol:"$", name:"US Dollar" },
  { code:"EUR", symbol:"€", name:"Euro" },
  { code:"GBP", symbol:"£", name:"British Pound" },
  { code:"CAD", symbol:"$", name:"Canadian Dollar" },
  { code:"AUD", symbol:"$", name:"Australian Dollar" },
  { code:"INR", symbol:"₹", name:"Indian Rupee" },
  { code:"NGN", symbol:"₦", name:"Nigerian Naira" },
  { code:"ZAR", symbol:"R", name:"South African Rand" },
  { code:"JPY", symbol:"¥", name:"Japanese Yen" },
  { code:"CHF", symbol:"CHF", name:"Swiss Franc" }
];

let activeCurrency = currencies[0];

currencies.forEach(c => {
  const opt = document.createElement("option");
  opt.value = c.code;
  opt.textContent = `${c.code} – ${c.name}`;
  currencySelect.appendChild(opt);
});

currencySelect.addEventListener("change", () => {
  activeCurrency = currencies.find(c => c.code === currencySelect.value);
  currencyInfo.textContent = `Currency: ${activeCurrency.code}`;
  recalc();
});

// ---------- ITEMS ----------
function addRow() {
  const maxItems = selectedPlan === "free" ? 2 : selectedPlan === "basic" ? 5 : 999;
  if (itemsBody.rows.length >= maxItems) {
    alert(`${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan allows max ${maxItems} items. Upgrade for more.`);
    return;
  }

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input placeholder="Description"></td>
    <td><input type="number" value="1"></td>
    <td><input type="number" value="0"></td>
    <td class="lineTotal">0.00</td>
    <td><button onclick="removeRow(this)">✕</button></td>
  `;
  itemsBody.appendChild(tr);
  recalc();
}

function removeRow(btn) {
  btn.closest("tr").remove();
  recalc();
}

// ---------- CALCULATOR ----------
document.addEventListener("input", recalc);

function recalc() {
  let subtotal = 0;

  [...itemsBody.rows].forEach(row => {
    const qty = Number(row.cells[1].querySelector("input").value) || 0;
    const price = Number(row.cells[2].querySelector("input").value) || 0;
    const lineTotal = qty * price;

    row.cells[3].textContent =
      `${activeCurrency.symbol}${lineTotal.toFixed(2)}`;

    subtotal += lineTotal;
  });

  const taxRate = Number(document.getElementById("taxRate").value) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  subtotalDisplay.textContent =
    `${activeCurrency.symbol}${subtotal.toFixed(2)}`;
  taxDisplay.textContent =
    `${activeCurrency.symbol}${taxAmount.toFixed(2)}`;
  totalDisplay.textContent =
    `${activeCurrency.symbol}${grandTotal.toFixed(2)}`;

  updateHealth(subtotal);
}

// ---------- HEALTH ----------
function updateHealth(subtotal) {
  let score = 100;
  let tips = [];

  if (!clientName.value) { score -= 20; tips.push("Add client name"); }
  if (subtotal <= 0) { score -= 40; tips.push("Invoice total is zero"); }

  const el = document.getElementById("healthScore");
  el.textContent = score + "/100";
  el.className = "score " + (score >= 80 ? "good" : score >= 50 ? "warn" : "bad");

  document.getElementById("tips").innerHTML = tips.join("<br>");
}

// ---------- CLIENT VIEW ----------
function toggleClientView() {
  document.body.classList.toggle("clientView");
}

// ---------- PDF ----------
pdfBtn.addEventListener("click", () => {
  if (selectedPlan === "free") {
    alert("PDF download is a premium feature. Please upgrade.");
    return;
  }
  generateInvoice(); // your existing generateInvoice function
});

function generateInvoice() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("INVOICE", 20, 20);
  doc.text(`Currency: ${activeCurrency.code}`, 150, 20);

  const rows = [];
  [...itemsBody.rows].forEach(r => {
    rows.push([
      r.cells[0].querySelector("input").value,
      r.cells[1].querySelector("input").value,
      `${activeCurrency.symbol}${r.cells[2].querySelector("input").value}`,
      r.cells[3].textContent
    ]);
  });

  doc.autoTable({
    startY: 40,
    head: [["Item","Qty","Price","Total"]],
    body: rows
  });

  doc.text(`Total: ${totalDisplay.textContent}`, 150, doc.lastAutoTable.finalY + 10);
  invoicePreview.src = doc.output("datauristring");
}

// ---------- START ----------
addRow();
currencyInfo.textContent = "Currency: USD";
