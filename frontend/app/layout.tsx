import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./api/providers/ReactQueryProvider";
import { AuthProvider } from "@/app/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ✅ suppressHydrationWarning prevents the mismatch error caused by
    // next-themes injecting class="dark" and style={{color-scheme}} on the
    // client after SSR renders the tag without those attributes.
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}