import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./api/providers/Providers";

export const metadata: Metadata = {
  title: "BrainTrust LMS",
  description: "Plataforma de aprendizaje en línea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
