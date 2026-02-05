// ---------- INIT ----------
document.getElementById("invoiceDate").textContent = new Date().toLocaleDateString();

const currencySelect = document.getElementById("currencySelect");
const currencyInfo = document.getElementById("currencyInfo");

const subtotalDisplay = document.getElementById("subtotalDisplay");
const taxDisplay = document.getElementById("taxDisplay");
const totalDisplay = document.getElementById("totalDisplay");

const itemsBody = document.getElementById("itemsBody");
const planCards = document.querySelectorAll(".plan-card");

let selectedPlan = "free";   // Active plan (features unlocked)
let intendedPlan = "free";   // Plan user clicked (may require payment)

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

// ---------- PLAN LOGIC ----------
planCards.forEach(card => {
  card.addEventListener('click', () => {
    const plan = card.getAttribute('data-plan');

    // Free plan unlocks immediately
    if(plan === "free") {
      selectedPlan = "free";
      intendedPlan = "free";
      updateFeatureAccess();
      planCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      return;
    }

    // Paid plans: show alert, require payment
    intendedPlan = plan;
    alert(`The ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan requires payment. Use the PayPal button to unlock.`);

    // Highlight clicked plan
    planCards.forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    // Do NOT update selectedPlan yet
    updateFeatureAccess(); // keeps features locked
  });
});

function updateFeatureAccess() {
  const pdfBtn = document.getElementById('pdfBtn');
  const sendBtn = document.getElementById('sendBtn');
  const saveBtn = document.getElementById('saveBtn');

  // Free: only basic preview
  if(selectedPlan === "free") {
    pdfBtn.classList.remove("unlocked");
    sendBtn.classList.remove("unlocked");
    saveBtn.classList.remove("unlocked");
  }

  // Basic plan: unlock PDF + Save
  else if(selectedPlan === "basic") {
    pdfBtn.classList.add("unlocked");
    sendBtn.classList.remove("unlocked");
    saveBtn.classList.add("unlocked");
  }

  // Pro plan: unlock all
  else if(selectedPlan === "pro") {
    pdfBtn.classList.add("unlocked");
    sendBtn.classList.add("unlocked");
    saveBtn.classList.add("unlocked");
  }
}

updateFeatureAccess();

// ---------- ITEMS ----------
function addRow() {
  const maxItems = selectedPlan === "free" ? 2 : selectedPlan === "basic" ? 5 : 999;

  if(itemsBody.rows.length >= maxItems) {
    alert(`Your plan allows maximum ${maxItems} items. Upgrade for more.`);
    return;
  }

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input placeholder="Description"></td>
    <td><input type="number" value="1" min="1"></td>
    <td><input type="number" value="0" min="0"></td>
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

document.getElementById("addItemBtn").addEventListener("click", addRow);
addRow();

// ---------- CALCULATOR ----------
document.addEventListener("input", recalc);

function recalc() {
  let subtotal = 0;
  [...itemsBody.rows].forEach(row => {
    const qty = Number(row.cells[1].querySelector("input").value) || 0;
    const price = Number(row.cells[2].querySelector("input").value) || 0;
    const lineTotal = qty * price;
    row.cells[3].textContent = `${activeCurrency.symbol}${lineTotal.toFixed(2)}`;
    subtotal += lineTotal;
  });

  const taxRate = Number(document.getElementById("taxRate").value) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  subtotalDisplay.textContent = `${activeCurrency.symbol}${subtotal.toFixed(2)}`;
  taxDisplay.textContent = `${activeCurrency.symbol}${taxAmount.toFixed(2)}`;
  totalDisplay.textContent = `${activeCurrency.symbol}${grandTotal.toFixed(2)}`;
}

// ---------- PAYPAL BUTTONS ----------
paypal.Buttons({
  style: { shape: 'rect', color: 'blue', layout: 'vertical', label: 'pay' },
  createOrder: function(data, actions) {
    let amount = 0;
    if(intendedPlan === 'basic') amount = 5;
    else if(intendedPlan === 'pro') amount = 10;

    return actions.order.create({
      purchase_units: [{
        amount: { value: amount.toString() },
        description: `${intendedPlan.charAt(0).toUpperCase()+intendedPlan.slice(1)} Plan`
      }]
    });
  },
  onApprove: function(data, actions) {
    return actions.order.capture().then(details => {
      alert(`Payment completed by ${details.payer.name.given_name}. ${intendedPlan} plan unlocked!`);
      selectedPlan = intendedPlan; // Unlock features after payment
      updateFeatureAccess();
    });
  },
  onError: function(err) {
    console.error(err);
    alert('Payment could not be processed.');
  }
}).render('#paypal-basic');

paypal.Buttons({
  style: { shape: 'rect', color: 'blue', layout: 'vertical', label: 'pay' },
  createOrder: function(data, actions) {
    return actions.order.create({
      purchase_units: [{
        amount: { value: "10" },
        description: `Pro Plan`
      }]
    });
  },
  onApprove: function(data, actions) {
    return actions.order.capture().then(details => {
      alert(`Payment completed by ${details.payer.name.given_name}. Pro plan unlocked!`);
      selectedPlan = "pro";
      intendedPlan = "pro";
      updateFeatureAccess();
    });
  },
  onError: function(err) {
    console.error(err);
    alert('Payment could not be processed.');
  }
}).render('#paypal-pro');
