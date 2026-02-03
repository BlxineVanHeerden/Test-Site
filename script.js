const { jsPDF } = window.jspdf;

function generateInvoice() {
  const yourName = document.getElementById("yourName").value;
  const yourEmail = document.getElementById("yourEmail").value;
  const clientName = document.getElementById("clientName").value;
  const clientEmail = document.getElementById("clientEmail").value;
  const itemsRaw = document.getElementById("items").value;

  if (!yourName || !clientName || !itemsRaw) {
    alert("Please fill in required fields.");
    return;
  }

  const lines = itemsRaw.split("\n").filter(l => l.trim() !== "");

  let items = [];
  let total = 0;

  lines.forEach(line => {
    const parts = line.split("-");
    if (parts.length !== 2) return;

    const name = parts[0].trim();
    const price = Number(parts[1].trim());

    if (!name || isNaN(price)) return;

    items.push({ name, price });
    total += price;
  });

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Invoice", 105, 20, null, null, "center");

  doc.setFontSize(12);
  doc.text(`From: ${yourName} (${yourEmail})`, 20, 40);
  doc.text(`To: ${clientName} (${clientEmail})`, 20, 50);

  let y = 70;
  items.forEach(item => {
    doc.text(`${item.name} - $${item.price.toFixed(2)}`, 20, y);
    y += 10;
  });

  doc.text(`Total: $${total.toFixed(2)}`, 20, y + 10);

  document.getElementById("invoicePreview").src =
    doc.output("bloburl");
}
