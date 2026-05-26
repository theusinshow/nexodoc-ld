import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexoDoc LD Lab",
  description: "Protótipo isolado do Criador de Listas de Documentos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
