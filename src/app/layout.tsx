import "~/styles/globals.css";

import { type Metadata } from "next";
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
      <body className="text-spotify-100 bg-black font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
