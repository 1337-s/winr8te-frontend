import ConstructionBanner from "@/components/ConstructionBanner";

export const metadata = {
  title: "WINR8TE - Statistiques",
  description: "Consultez vos statistiques du wipe sur WINR8TE",
};

export default function RootLayout({ children }) {
  return (
    <div>
      <ConstructionBanner />
      {children}
    </div>
  );
}
