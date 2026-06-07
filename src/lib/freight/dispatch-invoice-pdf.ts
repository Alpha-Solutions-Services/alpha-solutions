import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { CarrierDispatchInvoice, InvoiceIssuer } from "./dispatch-invoice";
import { formatInvoiceDate } from "./dispatch-invoice";

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export async function renderCarrierInvoicePdf(
  invoice: CarrierDispatchInvoice,
  issuer: InvoiceIssuer,
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const { width, height } = page.getSize();
  const margin = 50;
  const contentWidth = width - margin * 2;

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const dark = rgb(0.07, 0.07, 0.07);
  const muted = rgb(0.4, 0.4, 0.4);
  const accent = rgb(0.15, 0.39, 0.92);

  let y = height - margin;

  const draw = (
    text: string,
    x: number,
    size: number,
    font = regular,
    color = dark,
  ) => {
    page.drawText(text, { x, y, size, font, color });
  };

  draw(issuer.contactName, margin, 11, regular, dark);
  y -= 14;
  draw(issuer.companyName, margin, 11);
  y -= 14;
  draw(issuer.addressLine1, margin, 11);
  y -= 14;
  draw(issuer.addressLine2, margin, 11);

  const invoiceLabel = `# ${invoice.invoiceNumber} ${invoice.carrierName}`;
  const dateStr = formatInvoiceDate(invoice.invoiceDate);
  page.drawText(invoiceLabel, {
    x: margin,
    y: height - margin,
    size: 11,
    font: regular,
    color: dark,
    maxWidth: contentWidth,
  });
  const dateWidth = regular.widthOfTextAtSize(dateStr, 11);
  page.drawText(dateStr, {
    x: width - margin - dateWidth,
    y: height - margin - 14,
    size: 11,
    font: regular,
    color: dark,
  });

  y -= 36;
  draw("Invoice", margin, 22, bold);

  y -= 28;
  const billTop = y;
  draw("BILL TO", margin, 10, regular, muted);
  page.drawText("PAYMENT", {
    x: margin + contentWidth / 2 + 10,
    y: billTop,
    size: 10,
    font: regular,
    color: muted,
  });

  y -= 16;
  let billY = y;
  if (invoice.billTo.contactName) {
    draw(invoice.billTo.contactName, margin, 11);
    billY -= 14;
    y = billY;
  }
  draw(invoice.billTo.companyName, margin, 11, bold);
  billY -= 14;
  y = billY;
  if (invoice.billTo.addressLine) {
    draw(invoice.billTo.addressLine, margin, 11);
    billY -= 14;
    y = billY;
  }
  if (invoice.billTo.email) {
    draw(invoice.billTo.email, margin, 11);
    billY -= 14;
    y = billY;
  }
  if (invoice.billTo.phone) {
    draw(invoice.billTo.phone, margin, 11);
    billY -= 14;
    y = billY;
  }

  page.drawText(`Due Date: ${formatInvoiceDate(invoice.dueDate)}`, {
    x: margin + contentWidth / 2 + 10,
    y: billTop - 16,
    size: 11,
    font: regular,
    color: dark,
  });

  y = Math.min(y, billY) - 28;
  const colItem = margin;
  const colQty = margin + contentWidth * 0.62;
  const colRate = margin + contentWidth * 0.74;
  const colAmount = margin + contentWidth * 0.86;

  page.drawText("ITEM", { x: colItem, y, size: 9, font: bold, color: muted });
  page.drawText("QUANTITY", { x: colQty, y, size: 9, font: bold, color: muted });
  page.drawText("RATE", { x: colRate, y, size: 9, font: bold, color: muted });
  page.drawText("AMOUNT", { x: colAmount, y, size: 9, font: bold, color: muted });

  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  y -= 16;
  for (const item of invoice.lineItems) {
    const descLines = wrapText(item.description, regular, 9, contentWidth * 0.58);
    for (let i = 0; i < descLines.length; i++) {
      page.drawText(descLines[i], {
        x: colItem,
        y: y - i * 12,
        size: 9,
        font: regular,
        color: dark,
      });
    }
    const rowHeight = Math.max(descLines.length * 12, 14);
    page.drawText(String(item.quantity), {
      x: colQty,
      y,
      size: 9,
      font: regular,
      color: dark,
    });
    page.drawText(formatMoney(item.rate), {
      x: colRate,
      y,
      size: 9,
      font: regular,
      color: dark,
    });
    page.drawText(formatMoney(item.amount), {
      x: colAmount,
      y,
      size: 9,
      font: regular,
      color: dark,
    });
    y -= rowHeight + 8;

    if (y < 120) break;
  }

  y -= 8;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 16;
  page.drawText("Total", { x: colRate - 20, y, size: 11, font: bold, color: dark });
  page.drawText(formatMoney(invoice.total), {
    x: colAmount,
    y,
    size: 11,
    font: bold,
    color: dark,
  });

  y -= 36;
  page.drawText("Zelle", { x: margin, y, size: 11, font: bold, color: dark });
  y -= 16;
  page.drawText(`Number : ${issuer.zelleNumber}`, {
    x: margin,
    y,
    size: 10,
    font: regular,
    color: dark,
  });
  y -= 14;
  page.drawText(`Name : ${issuer.zelleName}`, {
    x: margin,
    y,
    size: 10,
    font: regular,
    color: dark,
  });

  y -= 32;
  page.drawText("TERMS", { x: margin, y, size: 10, font: bold, color: muted });
  y -= 14;
  page.drawText(`Thank you for choosing ${issuer.companyName}.`, {
    x: margin,
    y,
    size: 10,
    font: regular,
    color: dark,
    maxWidth: contentWidth,
  });
  y -= 14;
  page.drawText(issuer.website, {
    x: margin,
    y,
    size: 10,
    font: regular,
    color: accent,
  });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [text];
}
