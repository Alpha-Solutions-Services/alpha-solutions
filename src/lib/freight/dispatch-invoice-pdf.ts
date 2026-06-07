import PDFDocument from "pdfkit";
import type { CarrierDispatchInvoice, InvoiceIssuer } from "./dispatch-invoice";
import { formatInvoiceDate } from "./dispatch-invoice";

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function collectPdfBuffer(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

export async function renderCarrierInvoicePdf(
  invoice: CarrierDispatchInvoice,
  issuer: InvoiceIssuer,
): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50, size: "LETTER" });
  const bufferPromise = collectPdfBuffer(doc);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const left = doc.page.margins.left;

  doc.fontSize(11).fillColor("#111111");
  doc.text(issuer.contactName, left, 50);
  doc.text(issuer.companyName);
  doc.text(issuer.addressLine1);
  doc.text(issuer.addressLine2);

  const invoiceLabel = `# ${invoice.invoiceNumber} ${invoice.carrierName}`;
  doc.fontSize(11).text(invoiceLabel, left, 50, { align: "right", width: pageWidth });
  doc.text(formatInvoiceDate(invoice.invoiceDate), { align: "right", width: pageWidth });

  doc.moveDown(2);
  doc.fontSize(22).text("Invoice", left);

  const billTop = doc.y + 16;
  const colWidth = pageWidth / 2 - 10;

  doc.fontSize(10).fillColor("#666666").text("BILL TO", left, billTop);
  doc.fillColor("#111111").fontSize(11);
  let billY = billTop + 14;
  if (invoice.billTo.contactName) {
    doc.text(invoice.billTo.contactName, left, billY);
    billY += 14;
  }
  doc.text(invoice.billTo.companyName, left, billY);
  billY += 14;
  if (invoice.billTo.addressLine) {
    doc.text(invoice.billTo.addressLine, left, billY, { width: colWidth });
    billY += 14;
  }
  if (invoice.billTo.email) {
    doc.text(invoice.billTo.email, left, billY);
    billY += 14;
  }
  if (invoice.billTo.phone) {
    doc.text(invoice.billTo.phone, left, billY);
  }

  const payLeft = left + colWidth + 20;
  doc.fillColor("#666666").fontSize(10).text("PAYMENT", payLeft, billTop);
  doc.fillColor("#111111").fontSize(11).text(
    `Due Date: ${formatInvoiceDate(invoice.dueDate)}`,
    payLeft,
    billTop + 14,
  );

  const tableTop = Math.max(doc.y, billY) + 28;
  const colItem = left;
  const colQty = left + pageWidth * 0.62;
  const colRate = left + pageWidth * 0.74;
  const colAmount = left + pageWidth * 0.86;

  doc.fontSize(9).fillColor("#666666");
  doc.text("ITEM", colItem, tableTop);
  doc.text("QUANTITY", colQty, tableTop);
  doc.text("RATE", colRate, tableTop);
  doc.text("AMOUNT", colAmount, tableTop);

  doc.moveTo(left, tableTop + 14).lineTo(left + pageWidth, tableTop + 14).stroke("#cccccc");

  let rowY = tableTop + 22;
  doc.fillColor("#111111").fontSize(9);

  for (const item of invoice.lineItems) {
    const itemHeight = doc.heightOfString(item.description, { width: pageWidth * 0.58 });
    doc.text(item.description, colItem, rowY, { width: pageWidth * 0.58 });
    doc.text(String(item.quantity), colQty, rowY);
    doc.text(formatMoney(item.rate), colRate, rowY);
    doc.text(formatMoney(item.amount), colAmount, rowY);
    rowY += Math.max(itemHeight, 14) + 8;

    if (rowY > doc.page.height - 160) {
      doc.addPage();
      rowY = doc.page.margins.top;
    }
  }

  rowY += 8;
  doc.moveTo(left, rowY).lineTo(left + pageWidth, rowY).stroke("#cccccc");
  rowY += 12;
  doc.fontSize(11).text("Total", colRate - 20, rowY);
  doc.text(formatMoney(invoice.total), colAmount, rowY);

  rowY += 36;
  doc.fontSize(11).text("Zelle", left, rowY);
  rowY += 16;
  doc.fontSize(10).text(`Number : ${issuer.zelleNumber}`, left, rowY);
  rowY += 14;
  doc.text(`Name : ${issuer.zelleName}`, left, rowY);

  rowY += 32;
  doc.fontSize(10).fillColor("#666666").text("TERMS", left, rowY);
  rowY += 14;
  doc.fillColor("#111111").text(
    `Thank you for choosing ${issuer.companyName}.`,
    left,
    rowY,
    { width: pageWidth },
  );
  rowY += 14;
  doc.fillColor("#2563eb").text(issuer.website, left, rowY, { link: issuer.website });

  return bufferPromise;
}
