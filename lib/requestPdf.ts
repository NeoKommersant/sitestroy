"use client";

import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { RequestItem } from "@/components/providers/RequestProvider";
import { COMPANY_INFO } from "@/lib/companyInfo";

type RequesterInfo = {
  name: string;
  email: string;
  phone: string;
  company?: string;
};

export type PdfRequestPayload = {
  items: RequestItem[];
  projectNote?: string;
  requester: RequesterInfo;
};

const PAGE_WIDTH = 595.28; // A4 width in points
const PAGE_HEIGHT = 841.89; // A4 height in points
const MARGIN = 48;
const HEADER_GAP = 18;
const TABLE_HEADER_HEIGHT = 24;
const ROW_GAP = 6;

type ColumnDescriptor = {
  key: "index" | "title" | "unit" | "quantity" | "comment";
  title: string;
  width: number;
  align?: "left" | "center" | "right";
};

const COLUMNS: ColumnDescriptor[] = [
  { key: "index", title: "№", width: 28, align: "center" },
  { key: "title", title: "Наименование", width: 240 },
  { key: "unit", title: "Ед.", width: 52, align: "center" },
  { key: "quantity", title: "Кол-во", width: 70, align: "right" },
  { key: "comment", title: "Комментарий", width: PAGE_WIDTH - MARGIN * 2 - (28 + 240 + 52 + 70) },
];

type PreparedRow = {
  lines: Record<ColumnDescriptor["key"], string[]>;
  height: number;
};

const loadFont = async (path: string) => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Не удалось загрузить шрифт: ${path}`);
  }
  return response.arrayBuffer();
};

const wrapText = (font: PDFFont, text: string, maxWidth: number, fontSize: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = words[0];

  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  lines.push(current);
  return lines;
};

const formatQuantity = (quantity: number) => {
  if (Number.isInteger(quantity)) return quantity.toString();
  return quantity.toFixed(3).replace(/\.?0+$/, "");
};

const ensurePageCapacity = (
  doc: PDFDocument,
  currentPage: { page: ReturnType<PDFDocument["addPage"]>; cursorY: number },
  requiredHeight: number,
) => {
  if (currentPage.cursorY - requiredHeight < MARGIN) {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    return { page, cursorY: PAGE_HEIGHT - MARGIN };
  }
  return currentPage;
};

const drawHeader = (
  page: ReturnType<PDFDocument["addPage"]>,
  fonts: { regular: PDFFont; medium: PDFFont },
  requester: RequesterInfo,
) => {
  let cursorY = PAGE_HEIGHT - MARGIN;
  page.drawText("Заявка на поставку", {
    x: MARGIN,
    y: cursorY,
    size: 20,
    font: fonts.medium,
    color: rgb(0.133, 0.4, 0.39),
  });

  cursorY -= HEADER_GAP;
  page.drawText(`Дата: ${new Date().toLocaleDateString("ru-RU")}`, {
    x: MARGIN,
    y: cursorY,
    size: 11,
    font: fonts.regular,
    color: rgb(0.18, 0.2, 0.21),
  });

  cursorY -= 14;
  page.drawText(`Ответственный: ${requester.name || "—"}`, {
    x: MARGIN,
    y: cursorY,
    size: 11,
    font: fonts.regular,
    color: rgb(0.18, 0.2, 0.21),
  });

  cursorY -= 14;
  page.drawText(`Компания: ${requester.company || "—"}`, {
    x: MARGIN,
    y: cursorY,
    size: 11,
    font: fonts.regular,
    color: rgb(0.18, 0.2, 0.21),
  });

  cursorY = PAGE_HEIGHT - MARGIN;
  const rightX = PAGE_WIDTH - MARGIN - 200;
  page.drawText(COMPANY_INFO.displayName, {
    x: rightX,
    y: cursorY,
    size: 14,
    font: fonts.medium,
    color: rgb(0.18, 0.2, 0.21),
  });

  cursorY -= 16;
  const companyLines = [
    COMPANY_INFO.legalName,
    COMPANY_INFO.address,
    `ИНН ${COMPANY_INFO.inn}, КПП ${COMPANY_INFO.kpp}`,
    `ОГРН ${COMPANY_INFO.ogrn}`,
    `Тел.: ${COMPANY_INFO.phone}`,
    `Email: ${COMPANY_INFO.email}`,
    COMPANY_INFO.website,
  ];

  for (const line of companyLines) {
    page.drawText(line, {
      x: rightX,
      y: cursorY,
      size: 9,
      font: fonts.regular,
      color: rgb(0.18, 0.2, 0.21),
    });
    cursorY -= 12;
  }

  return PAGE_HEIGHT - MARGIN - HEADER_GAP * 2 - companyLines.length * 12;
};

const prepareRows = (
  items: RequestItem[],
  fonts: { regular: PDFFont },
  fontSize: number,
): PreparedRow[] => {
  return items.map((item, index) => {
    const lines: PreparedRow["lines"] = {
      index: [String(index + 1)],
      title: [],
      unit: [item.unit],
      quantity: [formatQuantity(item.quantity)],
      comment: [],
    };

    const descriptor = `${item.category} / ${item.subcategory}`;
    const titleLines = wrapText(
      fonts.regular,
      `${item.title}${item.custom ? " (добавлено вручную)" : ""}`,
      COLUMNS[1].width - 8,
      fontSize,
    );

    const descriptorLines = wrapText(fonts.regular, descriptor, COLUMNS[1].width - 8, fontSize - 1);
    lines.title = [...titleLines, ...descriptorLines.map((line) => `· ${line}`)];

    if (item.comment) {
      lines.comment = wrapText(fonts.regular, item.comment, COLUMNS[4].width - 8, fontSize);
    } else {
      lines.comment = [""];
    }

    const maxLines = Math.max(
      lines.index.length,
      lines.title.length,
      lines.unit.length,
      lines.quantity.length,
      lines.comment.length,
    );

    const height = maxLines * (fontSize + ROW_GAP);
    return { lines, height };
  });
};

const drawTableHeader = (
  page: ReturnType<PDFDocument["addPage"]>,
  fonts: { medium: PDFFont },
  cursorY: number,
) => {
  let offsetX = MARGIN;
  for (const column of COLUMNS) {
    page.drawText(column.title, {
      x: offsetX + 4,
      y: cursorY - TABLE_HEADER_HEIGHT + 8,
      size: 11,
      font: fonts.medium,
      color: rgb(0.18, 0.2, 0.21),
    });
    offsetX += column.width;
  }
  page.drawLine({
    start: { x: MARGIN, y: cursorY - TABLE_HEADER_HEIGHT },
    end: { x: PAGE_WIDTH - MARGIN, y: cursorY - TABLE_HEADER_HEIGHT },
    thickness: 0.5,
    color: rgb(0.78, 0.82, 0.88),
  });
  return cursorY - TABLE_HEADER_HEIGHT - ROW_GAP;
};

const drawRow = (
  page: ReturnType<PDFDocument["addPage"]>,
  fonts: { regular: PDFFont },
  row: PreparedRow,
  cursorY: number,
  fontSize: number,
) => {
  let offsetX = MARGIN;
  const topY = cursorY;
  for (const column of COLUMNS) {
    const cellLines = row.lines[column.key];
    const totalCellHeight = cellLines.length * (fontSize + ROW_GAP);
    let lineY = topY - fontSize;

    if (column.align === "center") {
      const offset = (row.height - totalCellHeight) / 2;
      lineY = topY - offset - fontSize;
    } else if (column.align === "right") {
      const offset = row.height - totalCellHeight;
      lineY = topY - offset - fontSize;
    }

    for (const line of cellLines) {
      const textWidth = fonts.regular.widthOfTextAtSize(line, fontSize);
      let textX = offsetX + 4;
      if (column.align === "center") {
        textX = offsetX + column.width / 2 - textWidth / 2;
      } else if (column.align === "right") {
        textX = offsetX + column.width - textWidth - 4;
      }

      page.drawText(line, {
        x: textX,
        y: lineY,
        size: fontSize,
        font: fonts.regular,
        color: rgb(0.18, 0.2, 0.21),
      });
      lineY -= fontSize + ROW_GAP;
    }

    offsetX += column.width;
  }

  page.drawLine({
    start: { x: MARGIN, y: topY - row.height },
    end: { x: PAGE_WIDTH - MARGIN, y: topY - row.height },
    thickness: 0.25,
    color: rgb(0.9, 0.92, 0.94),
  });

  return topY - row.height - ROW_GAP;
};

const drawTotals = (
  page: ReturnType<PDFDocument["addPage"]>,
  fonts: { regular: PDFFont; medium: PDFFont },
  cursorY: number,
  items: RequestItem[],
) => {
  const totals = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.unit] = (acc[item.unit] ?? 0) + item.quantity;
    return acc;
  }, {});

  page.drawText(`Всего позиций: ${items.length}`, {
    x: MARGIN,
    y: cursorY,
    size: 11,
    font: fonts.medium,
    color: rgb(0.18, 0.2, 0.21),
  });

  cursorY -= 14;
  const totalsLine = Object.entries(totals)
    .map(([unit, qty]) => `${formatQuantity(qty)} ${unit}`)
    .join(" · ");

  page.drawText(`Итого по единицам: ${totalsLine || "—"}`, {
    x: MARGIN,
    y: cursorY,
    size: 10,
    font: fonts.regular,
    color: rgb(0.18, 0.2, 0.21),
  });

  return cursorY - 18;
};

const drawNote = (
  page: ReturnType<PDFDocument["addPage"]>,
  fonts: { regular: PDFFont; medium: PDFFont },
  cursorY: number,
  note?: string,
) => {
  if (!note) return cursorY;

  page.drawText("Комментарий к проекту", {
    x: MARGIN,
    y: cursorY,
    size: 12,
    font: fonts.medium,
    color: rgb(0.18, 0.2, 0.21),
  });

  cursorY -= 14;

  const lines = wrapText(fonts.regular, note, PAGE_WIDTH - MARGIN * 2, 10);
  for (const line of lines) {
    page.drawText(line, {
      x: MARGIN,
      y: cursorY,
      size: 10,
      font: fonts.regular,
      color: rgb(0.18, 0.2, 0.21),
    });
    cursorY -= 14;
  }

  return cursorY;
};

export async function downloadRequestPdf(payload: PdfRequestPayload) {
  if (payload.items.length === 0) {
    throw new Error("Список позиций пуст.");
  }

  const [regularFontBytes, mediumFontBytes] = await Promise.all([
    loadFont("/fonts/Roboto-Regular.ttf"),
    loadFont("/fonts/Roboto-Medium.ttf"),
  ]);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const regularFont = await doc.embedFont(regularFontBytes, { subset: true });
  const mediumFont = await doc.embedFont(mediumFontBytes, { subset: true });

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = drawHeader(page, { regular: regularFont, medium: mediumFont }, payload.requester);
  cursorY -= 12;
  cursorY = drawTableHeader(page, { medium: mediumFont }, cursorY);

  const fontSize = 10;
  const preparedRows = prepareRows(payload.items, { regular: regularFont }, fontSize);

  for (const row of preparedRows) {
    ({ page, cursorY } = ensurePageCapacity(doc, { page, cursorY }, row.height + ROW_GAP * 2 + fontSize));

    cursorY = drawRow(page, { regular: regularFont }, row, cursorY, fontSize);
  }

  cursorY -= 12;
  cursorY = drawTotals(page, { regular: regularFont, medium: mediumFont }, cursorY, payload.items);
  cursorY -= 10;
  cursorY = drawNote(page, { regular: regularFont, medium: mediumFont }, cursorY, payload.projectNote);

  cursorY -= 12;
  page.drawText(
    `Связаться: ${payload.requester.phone || "—"} · ${payload.requester.email || "—"} · ${COMPANY_INFO.telegram}`,
    {
      x: MARGIN,
      y: cursorY,
      size: 9,
      font: regularFont,
      color: rgb(0.18, 0.2, 0.21),
    },
  );

  const pdfBytes = await doc.save();
  const buffer = new ArrayBuffer(pdfBytes.length);
  new Uint8Array(buffer).set(pdfBytes);
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Заявка-${new Date().toISOString().slice(0, 10)}.pdf`;
  anchor.rel = "noreferrer";
  anchor.click();
  URL.revokeObjectURL(url);
}
