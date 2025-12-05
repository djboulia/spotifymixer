import "~/styles/globals.css";

import { type Metadata } from "next";
import { ThemeProvider } from "~/components/ThemeProvider";
import { Geist } from "next/font/google";
import AuthProvider from "~/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Spotify Mixer",
  description: "Custom playlist shuffler for Spotify",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      {/*
       * Suppress hydration warning for theme switching to avoid nextjs hydration mismatch.
       * Only applies one level deep, so this wwon't suppress hydraation errors in the rest of the app
       * https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
       */}
      <body
        className="text-foreground bg-background font-sans"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
