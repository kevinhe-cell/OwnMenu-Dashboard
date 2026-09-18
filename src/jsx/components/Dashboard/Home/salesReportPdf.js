import jsPDF from "jspdf";

const fmt = (v) => `$${(Number(v) || 0).toFixed(2)}`;
const fmtCount = (v) => String(Math.round(Number(v) || 0));

function drawTableHeader(pdf, cols, startX, y) {
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  const totalW = cols.reduce((s, c) => s + c.w, 0);
  pdf.rect(startX, y - 5, totalW, 7, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  let x = startX;
  cols.forEach((col) => {
    pdf.text(col.label, x + 1, y, { maxWidth: col.w - 2 });
    x += col.w;
  });
  pdf.setTextColor(15, 23, 42);
}

function drawTableRow(pdf, cols, row, startX, y, bold = false) {
  pdf.setFont("helvetica", bold ? "bold" : "normal");
  pdf.setFontSize(7);
  let x = startX;
  cols.forEach((col) => {
    const raw = row[col.key];
    const text =
      col.money ? fmt(raw) : col.count ? fmtCount(raw) : String(raw ?? "");
    pdf.text(text, x + 1, y, { maxWidth: col.w - 2 });
    x += col.w;
  });
}

const DAILY_MAIN_COLS = [
  { key: "dateLabel", label: "Date", w: 34 },
  { key: "totalSales", label: "Sales", w: 18, money: true },
  { key: "subtotal", label: "Subtotal", w: 18, money: true },
  { key: "totalTax", label: "Tax", w: 14, money: true },
  { key: "restaurantDeliveryFee", label: "Del.Fee", w: 14, money: true },
  { key: "totalDiscount", label: "Disc.", w: 14, money: true },
  { key: "totalNetReceivedOnlineOnly", label: "Net", w: 18, money: true },
  { key: "totalOrders", label: "Ord", w: 10, count: true },
];

const DAILY_SEP_COLS = [
  { key: "dateLabel", label: "Date", w: 34 },
  { key: "doordashDeliveryFee", label: "DD Fee", w: 18, money: true },
  { key: "doordashDeliveryTips", label: "DD Tip", w: 18, money: true },
  { key: "totalCommissionFee", label: "Comm.", w: 18, money: true },
  { key: "totalServiceFee", label: "Svc.", w: 18, money: true },
];

export function buildSalesReportPdf({
  restaurantName,
  periodLabel,
  sales,
  monthTableRows,
  monthColumnTotals,
  viewMode,
}) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 14;
  let y = margin;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(15, 23, 42);
  pdf.text("Sales Report", margin, y);
  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(71, 85, 105);
  pdf.text(restaurantName || "Restaurant", margin, y);
  y += 6;
  pdf.setFontSize(10);
  pdf.text(periodLabel, margin, y);
  y += 10;

  const kpis = [
    ["Total Sales", fmt(sales?.totalSales)],
    ["Total Tips", fmt(sales?.totalTipsAll ?? sales?.totalTips)],
    ["Net Received", fmt(sales?.totalNetReceivedOnlineOnly)],
    ["Total Orders", fmtCount(sales?.totalOrders)],
  ];

  const kpiW = (pdf.internal.pageSize.getWidth() - margin * 2 - 9) / 4;
  kpis.forEach(([label, value], i) => {
    const x = margin + i * (kpiW + 3);
    pdf.setDrawColor(226, 232, 240);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(x, y, kpiW, 18, 2, 2, "FD");
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text(label, x + 3, y + 6);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text(value, x + 3, y + 13);
    pdf.setFont("helvetica", "normal");
  });
  y += 26;

  const summaryLines = [
    ["Subtotal", fmt(sales?.subtotal)],
    ["Tax", fmt(sales?.totalTax)],
    ["Gross Sales", fmt(sales?.grossSales)],
    ["Restaurant Delivery Fee", fmt(sales?.restaurantDeliveryFee ?? sales?.totalDeliveryFee)],
    ["Discount", fmt(sales?.totalDiscount)],
    ["Total Tips", fmt(sales?.totalTipsAll ?? sales?.totalTips)],
    ["Total Sales", fmt(sales?.totalSales)],
    ["Refunded", fmt(sales?.totalRefundAmount)],
    ["Processing Charge", fmt(sales?.totalProcessingCharge)],
    ["Stripe / CC Charge", fmt(sales?.totalCreditCardCharge)],
    ["Net Received (Online)", fmt(sales?.totalNetReceivedOnlineOnly)],
  ];

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(15, 23, 42);
  pdf.text("Payout Summary", margin, y);
  y += 5;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  summaryLines.forEach(([label, value]) => {
    pdf.setTextColor(100, 116, 139);
    pdf.text(label, margin, y);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.text(value, pdf.internal.pageSize.getWidth() - margin, y, { align: "right" });
    pdf.setFont("helvetica", "normal");
    y += 5;
  });
  y += 4;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("Separate Charges (not in Total Sales)", margin, y);
  y += 5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  const sepLines = [
    ["DoorDash Fee", fmt(sales?.doordashDeliveryFee)],
    ["DoorDash Tips", fmt(sales?.doordashDeliveryTips)],
    ["Commission", fmt(sales?.totalCommissionFee)],
    ["Service Fee", fmt(sales?.totalServiceFee)],
  ];
  sepLines.forEach(([label, value]) => {
    pdf.setTextColor(100, 116, 139);
    pdf.text(label, margin, y);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.text(value, pdf.internal.pageSize.getWidth() - margin, y, { align: "right" });
    pdf.setFont("helvetica", "normal");
    y += 5;
  });

  if (viewMode === "month" && monthTableRows?.length > 0) {
    pdf.addPage("a4", "landscape");
    const pageH = pdf.internal.pageSize.getHeight();
    const startX = 10;
    y = 14;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("Daily Breakdown", startX, y);
    y += 8;

    const rowH = 5;
    const headerH = 8;
    const cols = DAILY_MAIN_COLS;
    const tableWidth = cols.reduce((s, c) => s + c.w, 0);

    const drawChunk = (rows, totalsRow, title) => {
      if (title) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text(title, startX, y);
        y += 6;
      }
      drawTableHeader(pdf, cols, startX, y);
      y += headerH;

      rows.forEach((row) => {
        if (y > pageH - 14) {
          pdf.addPage("a4", "landscape");
          y = 14;
          drawTableHeader(pdf, cols, startX, y);
          y += headerH;
        }
        drawTableRow(pdf, cols, row, startX, y);
        y += rowH;
      });

      if (totalsRow) {
        pdf.setDrawColor(226, 232, 240);
        pdf.line(startX, y - 2, startX + tableWidth, y - 2);
        drawTableRow(pdf, cols, totalsRow, startX, y, true);
        y += rowH + 6;
      }
    };

    const mainTotals = {
      dateLabel: "Month Total",
      ...monthColumnTotals,
    };
    drawChunk(monthTableRows, mainTotals, null);

    y += 4;
    const sepCols = DAILY_SEP_COLS;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("Separate Charges by Day", startX, y);
    y += 6;
    drawTableHeader(pdf, sepCols, startX, y);
    y += headerH;

    monthTableRows.forEach((row) => {
      if (y > pageH - 14) {
        pdf.addPage("a4", "landscape");
        y = 14;
        drawTableHeader(pdf, sepCols, startX, y);
        y += headerH;
      }
      drawTableRow(pdf, sepCols, row, startX, y);
      y += rowH;
    });

    const sepTotals = {
      dateLabel: "Month Total",
      doordashDeliveryFee: monthColumnTotals.doordashDeliveryFee,
      doordashDeliveryTips: monthColumnTotals.doordashDeliveryTips,
      totalCommissionFee: monthColumnTotals.totalCommissionFee,
      totalServiceFee: monthColumnTotals.totalServiceFee,
    };
    pdf.setDrawColor(226, 232, 240);
    pdf.line(startX, y - 2, startX + sepCols.reduce((s, c) => s + c.w, 0), y - 2);
    drawTableRow(pdf, sepCols, sepTotals, startX, y, true);
  }

  const safeName = (restaurantName || "Restaurant").replace(/[^\w\-]+/g, "_");
  pdf.save(`Sales_Report_${safeName}_${periodLabel.replace(/\//g, "-")}.pdf`);
}
