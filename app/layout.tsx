import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "ГК «Строй Альянс» — поставки и услуги для инфраструктурных проектов",
    template: "%s — ГК «Строй Альянс»",
  },
  description:
    "Комплексные поставки инженерных систем и стройматериалов для B2B и B2G проектов. Проектирование, монтаж, логистика, сервис.",
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-white text-slate-900 antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
