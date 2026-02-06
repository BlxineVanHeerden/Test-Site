// ---------- INIT ----------
document.getElementById("invoiceDate").textContent = new Date().toLocaleDateString();

const currencySelect = document.getElementById("currencySelect");
const currencyInfo = document.getElementById("currencyInfo");

const subtotalDisplay = document.getElementById("subtotalDisplay");
const taxDisplay = document.getElementById("taxDisplay");
const totalDisplay = document.getElementById("totalDisplay");

const itemsBody = document.getElementById("itemsBody");
const planCards = document.querySelectorAll(".plan-card");
const addItemBtn = document.getElementById("addItemBtn");

let selectedPlan = "free";    // Active plan (features unlocked)
let intendedPlan = null;      // Plan user clicked (requires payment)
let paidPlans = { basic: false, pro: false }; // Tracks if user paid for plans

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

    if(plan === "free") {
      selectedPlan = "free";
      intendedPlan = null;
      highlightPlanCard(plan);
      updateFeatureAccess();
      return;
    }

    // Paid plan clicked but not yet paid
    intendedPlan = plan;

    // If the user has already paid, allow
    if(paidPlans[plan]) {
      selectedPlan = plan;
      intendedPlan = null;
      highlightPlanCard(plan);
      updateFeatureAccess();
      return;
    }

    // Lock Add Item button until payment
    alert(`The ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan requires payment. Use PayPal button to unlock features.`);
    addItemBtn.disabled = true; // LOCK add item button
    highlightPlanCard(plan);
    updateFeatureAccess(); // keeps premium features locked
  });
});

function highlightPlanCard(plan) {
  planCards.forEach(c => c.classList.remove("selected"));
  const card = document.querySelector(`.plan-card[data-plan="${plan}"]`);
  if(card) card.classList.add("selected");
}

function updateFeatureAccess() {
  const pdfBtn = document.getElementById('pdfBtn');
  const sendBtn = document.getElementById('sendBtn');
  const saveBtn = document.getElementById('saveBtn');

  // Default: lock premium features
  pdfBtn.classList.remove("unlocked");
  sendBtn.classList.remove("unlocked");
  saveBtn.classList.remove("unlocked");

  let maxItems = 2; // Free plan
  if(selectedPlan === "free") maxItems = 2;
  else if(selectedPlan === "basic") maxItems = 5;
  else if(selectedPlan === "pro") maxItems = 999;

  addItemBtn.dataset.maxItems = maxItems;

  // Unlock features if plan is paid
  if(selectedPlan === "basic") {
    pdfBtn.classList.add("unlocked");
    saveBtn.classList.add("unlocked");
    addItemBtn.disabled = false; // UNLOCK add items
  } else if(selectedPlan === "pro") {
    pdfBtn.classList.add("unlocked");
    sendBtn.classList.add("unlocked");
    saveBtn.classList.add("unlocked");
    addItemBtn.disabled = false; // UNLOCK add items
  } else {
    addItemBtn.disabled = false; // Free plan can add items
  }
}

// ---------- ITEMS ----------
function addRow() {
  const maxItems = parseInt(addItemBtn.dataset.maxItems || 2, 10);

  if(itemsBody.rows.length >= maxItems) {
    alert(`Your plan allows maximum ${maxItems} items. Upgrade to add more.`);
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

addItemBtn.addEventListener("click", addRow);
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
function createPayPalButton(containerId, plan, amount) {
  paypal.Buttons({
    style: { shape: 'rect', color: 'blue', layout: 'vertical', label: 'pay' },
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: { value: amount.toString() },
          description: `${plan.charAt(0).toUpperCase()+plan.slice(1)} Plan`
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(details => {
        alert(`Payment completed by ${details.payer.name.given_name}. ${plan.charAt(0).toUpperCase()+plan.slice(1)} plan unlocked!`);
        selectedPlan = plan;
        paidPlans[plan] = true;      // Mark plan as paid
        intendedPlan = null;
        updateFeatureAccess();        // Unlock add items + features
        highlightPlanCard(plan);
      });
    },
    onError: function(err) {
      console.error(err);
      alert('Payment could not be processed.');
    }
  }).render(containerId);
}

createPayPalButton('#paypal-basic', 'basic', 5);
createPayPalButton('#paypal-pro', 'pro', 10)
