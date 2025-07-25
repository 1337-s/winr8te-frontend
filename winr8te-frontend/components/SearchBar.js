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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const trimmedSteamId = steamId.trim();

    if (!trimmedSteamId) {
      alert("Veuillez saisir un Steam ID");
      return;
    }

    if (!/^\d{17}$/.test(trimmedSteamId)) {
      alert(
        "Format Steam ID invalide. Il doit contenir exactement 17 chiffres."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/player/${trimmedSteamId}`, {
        method: "GET",
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
    <div>
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
    </div>
  );
}
