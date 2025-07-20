// app/stats/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StatsPage() {
  const [steamId, setSteamId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const trimmedSteamId = steamId.trim();

    if (!trimmedSteamId) {
      alert("Veuillez saisir un Steam ID");
      return;
    }

    // Validation basique format Steam ID (17 chiffres)
    if (!/^\d{17}$/.test(trimmedSteamId)) {
      alert(
        "Format Steam ID invalide. Il doit contenir exactement 17 chiffres."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/player/${trimmedSteamId}`, {
        method: "HEAD",
      });

      if (response.ok) {
        router.push(`/stats/${trimmedSteamId}`);
      } else {
        alert("Joueur non trouvé ou erreur du serveur");
      }
    } catch (error) {
      alert("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <main className="parent py-8">
        <h1 className="mb-8">Statistiques</h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Saisissez un Steam ID... (ex: 76561198012345678)"
            className="search-input"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Recherche..." : "Rechercher"}
          </button>
        </form>

        <div className="mt-8 text-text">
          <h2 className="text-white text-lg mb-4">
            Comment trouver votre Steam ID ?
          </h2>
          <div className="space-y-2">
            <p>1. Allez sur votre profil Steam</p>
            <p>2. Copiez votre URL sur votre profil</p>
            <p>
              3. Utilisez un convertisseur Steam ID en ligne pour obtenir votre
              Steam ID64
            </p>
            <p className="text-sm text-text/70">
              Le Steam ID doit être au format 76561198XXXXXXXXX (17 chiffres)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
