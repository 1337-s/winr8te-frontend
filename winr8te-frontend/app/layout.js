import "./globals.css";
import localFont from "next/font/local";
import { Roboto } from "next/font/google";
import Nav from "@/components/Nav";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-secondary",
  display: "swap",
});

const primaryFont = localFont({
  src: "../font/AldotheApache.ttf",
  variable: "--font-primary",
  display: "swap",
});

export const metadata = {
  title: "WINR8TE",
  description: "", // A AJOUTER
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={primaryFont.variable}>
      <body className="font-secondary max-w-screen overflow-x-hidden">
        <Nav />
        {children}
      </body>
    </html>
  );
}
