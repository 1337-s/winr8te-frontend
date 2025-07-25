import "./globals.css";
import localFont from "next/font/local";
import { Roboto } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

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
  title: "WINR8TE - Serveur Rust FR",
  description:
    "Le hub officiel de votre serveur Rust français : suivez vos stats, explorez les classements, lisez les guides et restez à jour avec les news", // A AJOUTER
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={primaryFont.variable}>
      <body className="font-secondary max-w-screen overflow-x-hidden bg-background">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
