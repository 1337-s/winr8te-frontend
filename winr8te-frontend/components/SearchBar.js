// components/SearchBar.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ compact = false }) {
  const [steamId, setSteamId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://217.154.27.52:3000/api";
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
    <div className={compact ? "" : "mt-8"}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder={
            compact ? "Saisissez un Steam ID..." : "Saisissez un Steam ID..."
          }
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

      {!compact && (
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
      )}
    </div>
  );
}
