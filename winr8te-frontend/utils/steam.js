// utils/steam.js
export async function getSteamProfile(steamId) {
  try {
    const response = await fetch(`/api/steam/profile?steamid=${steamId}`);

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération du profil Steam");
    }

    const data = await response.json();
    return data.profile;
  } catch (error) {
    console.error("Erreur Steam API:", error);
    return null;
  }
}

// Fonction pour convertir Steam ID 64 vers Steam ID 32 si nécessaire
export function steamId64ToSteamId32(steamId64) {
  const steamId64BigInt = BigInt(steamId64);
  const steamId32 = steamId64BigInt - BigInt("76561197960265728");
  return steamId32.toString();
}
