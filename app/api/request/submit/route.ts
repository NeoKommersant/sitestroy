"use server";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

const DEFAULT_EMAIL = "besmodeprod@bk.ru";
const DEFAULT_TELEGRAM_CHAT = "@besmodeprod";

const itemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  subcategory: z.string(),
  unit: z.string(),
  quantity: z.number().positive(),
  comment: z.string().optional(),
  custom: z.boolean().optional(),
});

const requestSchema = z.object({
  items: z.array(itemSchema).min(1, "Список позиций пуст."),
  projectNote: z.string().optional(),
  requester: z.object({
    name: z.string().min(1, "Укажите имя."),
    email: z.string().email("Проверьте адрес электронной почты."),
    phone: z.string().min(5, "Укажите телефон."),
    company: z.string().optional(),
  }),
});

type RequestPayload = z.infer<typeof requestSchema>;

const buildHtml = (payload: RequestPayload) => {
  const rows = payload.items
    .map(
      (item, index) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e2e8f0;">${index + 1}</td>
          <td style="padding:8px 12px;border:1px solid #e2e8f0;">
            <strong>${item.title}</strong><br/>
            <span style="color:#475569;font-size:12px;">${item.category} / ${item.subcategory}</span>
            ${item.custom ? '<span style="margin-left:6px;color:#0f766e;font-size:11px;">(добавлено вручную)</span>' : ""}
          </td>
          <td style="padding:8px 12px;border:1px solid #e2e8f0;">${item.unit}</td>
          <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:right;">${formatQuantity(item.quantity)}</td>
          <td style="padding:8px 12px;border:1px solid #e2e8f0;">${item.comment ?? ""}</td>
        </tr>`,
    )
    .join("");

  const totals = payload.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.unit] = (acc[item.unit] ?? 0) + item.quantity;
    return acc;
  }, {});
  const totalsLine = Object.entries(totals)
    .map(([unit, qty]) => `${formatQuantity(qty)} ${unit}`)
    .join(" · ");

  return `
    <div style="font-family:'Roboto','Segoe UI',sans-serif;font-size:14px;color:#0f172a;">
      <h2 style="font-size:20px;margin-bottom:8px;color:#0f766e;">Новая заявка с сайта</h2>
      <p style="margin:4px 0 2px;">Имя: <strong>${payload.requester.name}</strong></p>
      <p style="margin:2px 0;">Компания: ${payload.requester.company ?? "—"}</p>
      <p style="margin:2px 0;">Телефон: ${payload.requester.phone}</p>
      <p style="margin:2px 0;">Email: ${payload.requester.email}</p>
      ${
        payload.projectNote
          ? `<div style="margin:12px 0;padding:12px;border-left:4px solid #0f766e;background:#f1f5f9;">
              <div style="font-weight:600;margin-bottom:6px;">Комментарий к проекту</div>
              <div>${escapeHtml(payload.projectNote)}</div>
            </div>`
          : ""
      }
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <thead>
          <tr style="background:#ecfeff;color:#0f172a;">
            <th style="padding:10px 12px;text-align:left;border:1px solid #bae6fd;">№</th>
            <th style="padding:10px 12px;text-align:left;border:1px solid #bae6fd;">Наименование</th>
            <th style="padding:10px 12px;text-align:left;border:1px solid #bae6fd;">Ед.</th>
            <th style="padding:10px 12px;text-align:right;border:1px solid #bae6fd;">Кол-во</th>
            <th style="padding:10px 12px;text-align:left;border:1px solid #bae6fd;">Комментарий</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:16px;"><strong>Итого по единицам:</strong> ${totalsLine || "—"}</p>
    </div>
  `;
};

const buildText = (payload: RequestPayload) => {
  const header = [
    "Новая заявка с сайта",
    `Имя: ${payload.requester.name}`,
    `Компания: ${payload.requester.company ?? "—"}`,
    `Телефон: ${payload.requester.phone}`,
    `Email: ${payload.requester.email}`,
    payload.projectNote ? `Комментарий: ${payload.projectNote}` : null,
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const itemsText = payload.items
    .map((item, index) => {
      const lines = [
        `${index + 1}. ${item.title} — ${formatQuantity(item.quantity)} ${item.unit}`,
        `   Категория: ${item.category} / ${item.subcategory}`,
      ];
      if (item.comment) lines.push(`   Комментарий: ${item.comment}`);
      return lines.join("\n");
    })
    .join("\n");

  return `${header}${itemsText}`;
};

const buildTelegramMessage = (payload: RequestPayload) => {
  const base = [
    "📦 *Новая заявка*",
    `👤 ${escapeMarkdown(payload.requester.name)}`,
    payload.requester.company ? `🏢 ${escapeMarkdown(payload.requester.company)}` : null,
    `☎️ ${escapeMarkdown(payload.requester.phone)}`,
    `✉️ ${escapeMarkdown(payload.requester.email)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const body = payload.items
    .map((item, index) => {
      const title = `${index + 1}. ${escapeMarkdown(item.title)} — ${formatQuantity(item.quantity)} ${escapeMarkdown(
        item.unit,
      )}`;
      const cat = `   ${escapeMarkdown(item.category)} / ${escapeMarkdown(item.subcategory)}`;
      const comment = item.comment ? `   💬 ${escapeMarkdown(item.comment)}` : null;
      return [title, cat, comment].filter(Boolean).join("\n");
    })
    .join("\n");

  const note = payload.projectNote ? `\n📝 ${escapeMarkdown(payload.projectNote)}` : "";
  const message = `${base}\n\n${body}${note}`;
  return message.length > 3900 ? `${message.slice(0, 3900)}…` : message;
};

const formatQuantity = (value: number) => {
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(3).replace(/\.?0+$/, "");
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const escapeMarkdown = (value: string) => value.replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");

const sendEmail = async (payload: RequestPayload) => {
  const host = process.env.REQUEST_SMTP_HOST;
  const port = process.env.REQUEST_SMTP_PORT;
  const user = process.env.REQUEST_SMTP_USER;
  const pass = process.env.REQUEST_SMTP_PASSWORD;
  const to = process.env.REQUEST_EMAIL_TO ?? DEFAULT_EMAIL;
  const from = process.env.REQUEST_EMAIL_FROM ?? user ?? DEFAULT_EMAIL;

  if (!host || !port || !user || !pass || !to) {
    console.warn("Email sending skipped: SMTP credentials are missing.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  const subject = `Заявка с сайта (${payload.items.length} поз.) — ${payload.requester.name}`;
  await transporter.sendMail({
    from,
    to,
    subject,
    text: buildText(payload),
    html: buildHtml(payload),
  });
};

const sendTelegram = async (payload: RequestPayload) => {
  const token = process.env.REQUEST_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.REQUEST_TELEGRAM_CHAT_ID ?? DEFAULT_TELEGRAM_CHAT;

  if (!token || !chatId) {
    console.warn("Telegram sending skipped: bot credentials are missing.");
    return;
  }

  const message = buildTelegramMessage(payload);
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "MarkdownV2",
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Telegram API error: ${response.status} ${detail}`);
  }
};

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = requestSchema.parse(json);

    await Promise.all([sendEmail(payload), sendTelegram(payload)]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to process request payload", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "Некорректные данные" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Не удалось отправить заявку. Попробуйте позже." }, { status: 500 });
  }
}
