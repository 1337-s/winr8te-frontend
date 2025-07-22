// app/stats/[steamId]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";

export default function PlayerStatsPage() {
  const params = useParams();
  const { steamId } = params;
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredBodyPart, setHoveredBodyPart] = useState(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/player/${steamId}`);

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setPlayerData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (steamId) {
      fetchPlayerStats();
    }
  }, [steamId]);

  const [relatedPlayers, setRelatedPlayers] = useState({});

  useEffect(() => {
    if (!playerData?.combat) return;

    const fetchRelatedPlayers = async () => {
      const targets = [];
      const favoriteId = playerData.combat.favoriteTarget?.steamId;
      const nemesisId = playerData.combat.nemesis?.steamId;

      if (favoriteId) targets.push(favoriteId);
      if (nemesisId && nemesisId !== favoriteId) targets.push(nemesisId);

      try {
        const results = await Promise.all(
          targets.map(async (id) => {
            const res = await fetch(`${apiUrl}/player/${id}`);
            if (!res.ok) throw new Error(`Erreur fetch cible ${id}`);
            const data = await res.json();
            return { id, avatar: data.player?.steam?.avatarFull || null };
          })
        );

        const avatars = {};
        results.forEach(({ id, avatar }) => {
          if (avatar) avatars[id] = avatar;
        });

        setRelatedPlayers(avatars);
      } catch (err) {
        console.error("Erreur récupération avatars des cibles :", err);
      }
    };

    fetchRelatedPlayers();
  }, [playerData]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="grainy-background"></div>
        <main className="parent py-8 relative z-10">
          <div className="text-white text-center">
            <div className="animate-pulse">Chargement des statistiques...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen">
        <div className="grainy-background"></div>
        <main className="parent py-8 relative z-10">
          <div className="text-red-400 text-center">
            <h2 className="text-xl mb-4">Erreur lors du chargement</h2>
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="bg-background min-h-screen">
        <div className="grainy-background"></div>
        <main className="parent py-8 relative z-10">
          <div className="text-white text-center">
            <h2 className="text-xl">Aucune donnée trouvée pour ce joueur</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="grainy-background"></div>
      <main className="parent py-8 relative z-10 ">
        <div className="space-y-2 mt-10">
          {/* Barre de recherche en haut */}
          <div className="mb-6">
            <h1>Statistiques</h1>
            <SearchBar compact={true} />
          </div>
          {/* En-tête du joueur */}
          <div className="bg-component p-8 rounded flex gap-4">
            <div>
              <Image
                src={playerData.player.steam.avatarFull}
                alt={playerData.player.name}
                width={100}
                height={100}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1>{playerData.player.name}</h1>
                <div
                  className={`w-4 h-4 rounded-full ${
                    playerData.player.isOnline ? "bg-green" : "bg-blue"
                  }`}
                ></div>
              </div>

              <span className="text-text -mt-4 z-10">
                {playerData.player.steamId}
              </span>
            </div>
          </div>
          <div className="flex gap-2 w-full">
            <div className="flex w-2/3 flex-col gap-2">
              <div className="flex gap-2">
                <div className="stat-component">
                  <p>KD</p>
                  <p>{playerData.combat.kdRatio}</p>
                </div>
                <div className="stat-component">
                  <p>Kills</p>
                  <p>{playerData.combat.pvpKills}</p>
                </div>
                <div className="stat-component">
                  <p>Morts</p>
                  <p>{playerData.combat.deaths}</p>
                </div>
                <div className="stat-component">
                  <p>Tirs</p>
                  <p>{playerData.weapons.totalBulletsFired}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="stat-component">
                  <p>Avg. Distance</p>
                  <p>{playerData.combat.avgDistance} m</p>
                </div>
                <div className="stat-component">
                  <p>Max Distance</p>
                  <p>{playerData.combat.maxDistance} m</p>
                </div>
                <div className="stat-component">
                  <p>Items Craftés</p>
                  <p>{playerData.resources.totalCrafted}</p>
                </div>
                <div className="stat-component">
                  <p>Animaux Tués</p>
                  <p>{playerData.combat.animalKills}</p>
                </div>
              </div>

              <div className="bg-component pl-4 rounded flex ">
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_wood_icon.png"
                    alt="Bois"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <p>Bois</p>
                    <p>
                      {playerData.resources.gathered.find(
                        (r) => r.resource === "Wood"
                      )?.total_amount || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_stone_icon.png"
                    alt="Pierre"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <p>Pierre</p>
                    <p>
                      {playerData.resources.gathered.find(
                        (r) => r.resource === "Stones"
                      )?.total_amount || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_metal_icon.png"
                    alt="Métal"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <p>Métal</p>
                    <p>
                      {playerData.resources.gathered.find(
                        (r) => r.resource === "Metal Ore"
                      )?.total_amount || 0}
                    </p>{" "}
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_sulfur_icon.png"
                    alt="Soufre"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <p>Soufre</p>
                    <p>
                      {playerData.resources.gathered.find(
                        (r) => r.resource === "Sulfur Ore"
                      )?.total_amount || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-component pl-4 rounded flex ">
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_building_plan_icon.png"
                    alt="Constructions"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <p>Build</p>
                    <p>{playerData.building.totalBuildings}</p>
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_autoturret_icon.png"
                    alt="Pierre"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <p>Tourelle</p>
                    <p>
                      {playerData.building.deployables.find(
                        (d) => d.deployable === "Auto Turret"
                      )?.total_amount || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_tc_icon.png"
                    alt="Tool Cupboard"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <p>TC</p>
                    {playerData.building.deployables.find(
                      (d) => d.deployable === "Tool Cupboard"
                    )?.total_amount || 0}{" "}
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_sleeping_bag_icon.png"
                    alt="Sleeping Bag"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <p>Sleeping Bag</p>
                    {playerData.building.deployables.find(
                      (d) => d.deployable === "Sleeping Bag"
                    )?.total_amount || 0}{" "}
                  </div>
                </div>
              </div>
              <div className="bg-component pl-4 rounded flex ">
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_rocket_icon.png"
                    alt="Roquette"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <p>Roquette</p>
                    <p>
                      {playerData.weapons.bullets.find(
                        (b) => b.bullet_name === "Rocket"
                      )?.total_fired || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_c4_icon.png"
                    alt="C4"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <p>C4</p>
                    <p>
                      {playerData.weapons.bullets.find(
                        (b) => b.bullet_name === "Timed Explosive Charge"
                      )?.total_fired || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_satchel_icon.png"
                    alt="Satchel"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <p>Satchel</p>
                    <p>
                      {playerData.weapons.bullets.find(
                        (b) => b.bullet_name === "Satchel Charge"
                      )?.total_fired || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_explosive_ammo_icon.png"
                    alt="Balles explosives"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <p>Balle Explo</p>
                    <p>
                      {playerData.weapons.bullets
                        .filter(
                          (b) => b.bullet_name === "Explosive 5.56 Rifle Ammo"
                        )
                        .reduce(
                          (total, b) => total + parseInt(b.total_fired),
                          0
                        )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/3 flex flex-col gap-2">
              <div className="flex justify-center gap-2 p-4 rounded-[4px] bg-component h-fit">
                <div className="flex flex-col justify-center items-center">
                  <Image
                    src="/images/hit_head.png"
                    alt="Hit Head"
                    width={124}
                    height={124}
                    className={`transition-all cursor-pointer duration-200 ${
                      hoveredBodyPart === "head"
                        ? "scale-105 opacity-100"
                        : "scale-100 opacity-70"
                    }`}
                    onMouseEnter={() => setHoveredBodyPart("head")}
                    onMouseLeave={() => setHoveredBodyPart(null)}
                  />
                  <Image
                    src="/images/hit_torso.png"
                    alt="Hit Torso"
                    width={124}
                    height={124}
                    className={`transition-all cursor-pointer duration-200 ${
                      hoveredBodyPart === "torso"
                        ? "scale-105 opacity-100"
                        : "scale-100 opacity-70"
                    }`}
                    onMouseEnter={() => setHoveredBodyPart("torso")}
                    onMouseLeave={() => setHoveredBodyPart(null)}
                  />
                  <Image
                    src="/images/hit_legs.png"
                    alt="Hit Legs"
                    width={124}
                    height={124}
                    className={`transition-all cursor-pointer duration-200 ${
                      hoveredBodyPart === "legs"
                        ? "scale-105 opacity-100"
                        : "scale-100 opacity-70"
                    }`}
                    onMouseEnter={() => setHoveredBodyPart("legs")}
                    onMouseLeave={() => setHoveredBodyPart(null)}
                  />
                </div>

                <div className="flex flex-col gap-2 justify-center gap-6">
                  <div
                    className={`stat-component-row py-0 transition-opacity duration-200 ${
                      hoveredBodyPart === null || hoveredBodyPart === "head"
                        ? "opacity-100"
                        : "opacity-30"
                    }`}
                  >
                    <p>Tête</p>
                    <p>
                      {(playerData.combat.hitDistribution.head * 100).toFixed(
                        1
                      )}
                      %
                    </p>
                  </div>
                  <div
                    className={`stat-component-row py-0 transition-opacity duration-200 ${
                      hoveredBodyPart === null || hoveredBodyPart === "torso"
                        ? "opacity-100"
                        : "opacity-30"
                    }`}
                  >
                    <p>Torse</p>
                    <p>
                      {(playerData.combat.hitDistribution.body * 100).toFixed(
                        1
                      )}
                      %
                    </p>
                  </div>
                  <div
                    className={`stat-component-row py-0 transition-opacity duration-200 ${
                      hoveredBodyPart === null || hoveredBodyPart === "legs"
                        ? "opacity-100"
                        : "opacity-30"
                    }`}
                  >
                    <p>Jambes</p>
                    <p>
                      {(playerData.combat.hitDistribution.legs * 100).toFixed(
                        1
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>
              <div className="stat-component bg-blue/40">
                <div className="flex items-center justify-between">
                  {/* Texte à gauche */}
                  <div>
                    <p>Cible</p>
                    {playerData.combat.favoriteTarget ? (
                      <Link
                        href={`/stats/${playerData.combat.favoriteTarget.steamId}`}
                        className="link text-white"
                      >
                        {playerData.combat.favoriteTarget.name}
                      </Link>
                    ) : (
                      <p>Aucune</p>
                    )}
                  </div>

                  {/* Avatar à droite dans un Link */}
                  {playerData.combat.favoriteTarget &&
                    relatedPlayers[
                      playerData.combat.favoriteTarget.steamId
                    ] && (
                      <Link
                        href={`/stats/${playerData.combat.favoriteTarget.steamId}`}
                        className="ml-4 shrink-0"
                      >
                        <Image
                          src={
                            relatedPlayers[
                              playerData.combat.favoriteTarget.steamId
                            ]
                          }
                          alt="Avatar cible"
                          width={44}
                          height={44}
                        />
                      </Link>
                    )}
                </div>
              </div>
              <div className="stat-component bg-red/30">
                <div className="flex items-center justify-between">
                  {/* Texte à gauche */}
                  <div>
                    <p>Nemesis</p>
                    {playerData.combat.nemesis ? (
                      <Link
                        href={`/stats/${playerData.combat.nemesis.steamId}`}
                        className="link text-white"
                      >
                        {playerData.combat.nemesis.name}
                      </Link>
                    ) : (
                      <p>Aucun</p>
                    )}
                  </div>

                  {/* Avatar à droite dans un Link */}
                  {playerData.combat.nemesis &&
                    relatedPlayers[playerData.combat.nemesis.steamId] && (
                      <Link
                        href={`/stats/${playerData.combat.nemesis.steamId}`}
                        className="ml-4 shrink-0"
                      >
                        <Image
                          src={
                            relatedPlayers[playerData.combat.nemesis.steamId]
                          }
                          alt="Avatar nemesis"
                          width={44}
                          height={44}
                        />
                      </Link>
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-component p-6 rounded border border-text/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"></div>

            {/* Statistiques d'armes */}
            {playerData.combat.weaponStats &&
              playerData.combat.weaponStats.length > 0 && (
                <div>
                  <h3 className="text-white text-lg mb-3">
                    Statistiques des armes
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-text">
                      <thead>
                        <tr className="border-b border-text/20">
                          <th className="text-left py-2">Arme</th>
                          <th className="text-right py-2">Kills</th>
                          <th className="text-right py-2">Distance moy.</th>
                          <th className="text-right py-2">Distance max</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playerData.combat.weaponStats.map((weapon, index) => (
                          <tr key={index} className="border-b border-text/10">
                            <td className="py-2 text-white">{weapon.weapon}</td>
                            <td className="py-2 text-right">{weapon.kills}</td>
                            <td className="py-2 text-right">
                              {weapon.avgDistance}m
                            </td>
                            <td className="py-2 text-right">
                              {weapon.maxDistance}m
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
          {/* Ressources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Objets craftés */}
            {playerData.resources.crafted &&
              playerData.resources.crafted.length > 0 && (
                <div className="bg-component p-6 rounded border border-text/20">
                  <h2 className="text-white text-xl mb-4">Objets Craftés</h2>
                  <div className="space-y-2">
                    {playerData.resources.crafted
                      .slice(0, 5)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-text">{item.item}</span>
                          <span className="text-white font-semibold">
                            {item.total_amount}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}
