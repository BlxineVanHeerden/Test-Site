document.getElementById("invoiceDate").innerText =
  new Date().toLocaleDateString();

document.addEventListener("input", recalc);

function recalc() {
  let subtotal = 0;

  document.querySelectorAll("#itemsBody tr").forEach(row => {
    const qty = Number(row.children[1].querySelector("input").value) || 0;
    const price = Number(row.children[2].querySelector("input").value) || 0;
    const total = qty * price;

    row.querySelector(".lineTotal").innerText = `$${total.toFixed(2)}`;
    subtotal += total;
  });

  const taxRate = Number(document.getElementById("taxRate").value) || 0;
  const tax = subtotal * taxRate / 100;
  const grandTotal = subtotal + tax;

  document.getElementById("subtotal").innerText = `$${subtotal.toFixed(2)}`;
  document.getElementById("taxAmount").innerText = `$${tax.toFixed(2)}`;
  document.getElementById("grandTotal").innerText = `$${grandTotal.toFixed(2)}`;

  updateHealth(subtotal);
}

function addRow() {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input placeholder="New Item"></td>
    <td><input type="number" value="1" min="1"></td>
    <td><input type="number" value="0" min="0"></td>
    <td class="lineTotal">$0.00</td>
    <td><button onclick="removeRow(this)">✕</button></td>
  `;
  document.getElementById("itemsBody").appendChild(row);
}

function removeRow(btn) {
  btn.closest("tr").remove();
  recalc();
}

function updateHealth(subtotal) {
  let score = 100;
  let tips = [];

  if (!yourName.value) { score -= 15; tips.push("Add your business name"); }
  if (!clientName.value) { score -= 15; tips.push("Add client name"); }
  if (subtotal <= 0) { score -= 40; tips.push("Invoice total is zero"); }
  if (Number(taxRate.value) === 0) tips.push("Consider adding tax");

  const health = document.getElementById("healthScore");
  health.innerText = score + "/100";

  health.style.color =
    score >= 80 ? "green" : score >= 50 ? "orange" : "red";

  document.getElementById("healthTips").innerHTML =
    tips.map(t => "• " + t).join("<br>");
}

function generateInvoice() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.text("INVOICE", 20, 25);

  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoiceNumber.innerText}`, 20, 40);
  doc.text(`Date: ${invoiceDate.innerText}`, 20, 48);

  doc.text(`From: ${yourName.value}`, 120, 40);
  doc.text(`Email: ${yourEmail.value}`, 120, 48);
  doc.text(`To: ${clientName.value}`, 120, 56);
  doc.text(`Email: ${clientEmail.value}`, 120, 64);

  const items = [];
  document.querySelectorAll("#itemsBody tr").forEach(row => {
    const name = row.children[0].querySelector("input").value;
    const qty = row.children[1].querySelector("input").value;
    const price = row.children[2].querySelector("input").value;
    const total = (qty * price).toFixed(2);
    items.push([name, qty, `$${price}`, `$${total}`]);
  });

  doc.autoTable({
    startY: 75,
    head: [["Item", "Qty", "Price", "Total"]],
    body: items,
    theme: "grid"
  });

  const y = doc.lastAutoTable.finalY + 10;
  doc.text(`Subtotal: ${subtotal.innerText}`, 140, y);
  doc.text(`Tax: ${taxAmount.innerText}`, 140, y + 8);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${grandTotal.innerText}`, 140, y + 16);

  document.getElementById("invoicePreview").src =
    doc.output("datauristring");
}

recalc();
