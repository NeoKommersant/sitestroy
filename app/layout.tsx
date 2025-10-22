import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { RequestProvider } from "@/components/providers/RequestProvider";
import { RequestFab } from "@/components/RequestFab";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "СТРОЙ-Альянс — комплексные поставки инженерного оборудования",
    template: "%s — СТРОЙ-Альянс",
  },
  description:
    "Комплексная комплектация объектов B2B и B2G: инженерные сети, материалы, логистика и сопровождение.",
  alternates: { canonical: "/" },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-white text-slate-900 antialiased">
        <RequestProvider>
          <Header />
          <RequestFab />
          <main className="pt-[80px] md:pt-[96px]">{children}</main>
          <Footer />
        </RequestProvider>
      </body>
    </html>
  );
}
