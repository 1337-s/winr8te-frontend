// app/stats/[steamId]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Tooltip from "@/components/Tooltip";

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
  const [playerAvatar, setPlayerAvatar] = useState(null);

  useEffect(() => {
    if (!playerData?.combat) return;

    const fetchRelatedPlayers = async () => {
      const steamIds = [];

      // Ajouter le steamId du joueur principal
      steamIds.push(steamId);

      // Ajouter les steamIds des cibles et nemesis (premier de chaque tableau)
      const favoriteId = playerData.combat.favoriteTarget?.[0]?.steamId;
      const nemesisId = playerData.combat.nemesis?.[0]?.steamId;

      if (favoriteId) steamIds.push(favoriteId);
      if (nemesisId && nemesisId !== favoriteId) steamIds.push(nemesisId);

      try {
        const results = await Promise.all(
          steamIds.map(async (id) => {
            const res = await fetch(`${apiUrl}/steam/${id}`);
            if (!res.ok) throw new Error(`Erreur fetch steam ${id}`);
            const data = await res.json();
            return { id, avatar: data.avatarFull || null };
          })
        );

        const avatars = {};
        results.forEach(({ id, avatar }) => {
          if (avatar) {
            if (id === steamId) {
              setPlayerAvatar(avatar);
            } else {
              avatars[id] = avatar;
            }
          }
        });

        setRelatedPlayers(avatars);
      } catch (err) {
        console.error("Erreur récupération avatars Steam :", err);
      }
    };

    fetchRelatedPlayers();
  }, [playerData, steamId]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
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
      <main className="parent py-8 relative z-10 ">
        <div className="space-y-2 mt-10 px-2 lg:px-0">
          {/* Barre de recherche en haut */}
          <div className="mb-6">
            <h1 className="">Statistiques</h1>
            <SearchBar compact={true} />
          </div>
          {/* En-tête du joueur */}
          <div className="bg-component p-4 py-8 lg:p-8 rounded flex gap-4">
            {playerAvatar && (
              <div>
                <Image
                  src={playerAvatar}
                  alt={playerData.player.name}
                  width={100}
                  height={100}
                />
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1>{playerData.player.name}</h1>
                <Tooltip
                  content={
                    playerData.player.isOnline ? "Connecté" : "Déconnecté"
                  }
                >
                  <div
                    className={`lg:w-4 lg:h-4 w-2 h-2 rounded-full ${
                      playerData.player.isOnline ? "bg-green" : "bg-blue"
                    }`}
                  ></div>
                </Tooltip>
              </div>

              <span className="text-text -mt-2 lg:-mt-4 z-10">
                {playerData.player.steamId}
              </span>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-2 w-full">
            <div className="flex flex-col gap-2 lg:w-2/3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="stat-component">
                  <Tooltip content={"Ratio de Kills/Deaths PvP"}>
                    <p>KD</p>
                    <span>{playerData.combat.kdRatio}</span>{" "}
                  </Tooltip>
                </div>
                <div className="stat-component">
                  <Tooltip content={"Total des kills PvP"}>
                    <p>Kills</p>
                    <p>{playerData.combat.pvpKills}</p>{" "}
                  </Tooltip>
                </div>
                <div className="stat-component">
                  <Tooltip
                    content={
                      "Total des morts PvP (les suicides ne sont pas pris en compte dans le calcul)"
                    }
                  >
                    <p>Morts</p>
                    <p>{playerData.combat.deaths}</p>
                  </Tooltip>
                </div>
                <div className="stat-component">
                  <Tooltip content={"Total des tirs"}>
                    <p>Tirs</p>
                    <p>{playerData.weapons.totalBulletsFired}</p>
                  </Tooltip>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="stat-component">
                  <Tooltip content={"Distance moyenne des tirs"}>
                    <p>Avg. Distance</p>
                    <p>{playerData.combat.avgDistance} m</p>
                  </Tooltip>
                </div>
                <div className="stat-component">
                  <Tooltip content={"Distance maximale des tirs"}>
                    <p>Max Distance</p>
                    <p>{playerData.combat.maxDistance} m</p>
                  </Tooltip>
                </div>
                <div className="stat-component">
                  <Tooltip content={"Total des items craftés"}>
                    <p>Items Craftés</p>
                    <p>{playerData.resources.totalCrafted}</p>
                  </Tooltip>
                </div>
                <div className="stat-component">
                  <Tooltip content={"Total des animaux tués"}>
                    <p>Animaux Tués</p>
                    <p>{playerData.combat.animalKills}</p>
                  </Tooltip>
                </div>
              </div>

              <div className="bg-component pl-4 rounded grid grid-cols-2 md:grid-cols-4">
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_wood_icon.png"
                    alt="Bois"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <Tooltip content={"Total de bois récolté"}>
                      <p>Bois</p>
                      <p>
                        {playerData.resources.gathered.find(
                          (r) => r.resource === "Wood"
                        )?.total_amount || 0}
                      </p>
                    </Tooltip>
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
                    <Tooltip content={"Total de pierre récoltée"}>
                      <p>Pierre</p>
                      <p>
                        {playerData.resources.gathered.find(
                          (r) => r.resource === "Stones"
                        )?.total_amount || 0}
                      </p>
                    </Tooltip>
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
                    <Tooltip content={"Total de minerai de métal récolté"}>
                      <p>Métal</p>
                      <p>
                        {playerData.resources.gathered.find(
                          (r) => r.resource === "Metal Ore"
                        )?.total_amount || 0}
                      </p>
                    </Tooltip>
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
                    <Tooltip content={"Total de minerai de soufre récolté"}>
                      <p>Soufre</p>
                      <p>
                        {playerData.resources.gathered.find(
                          (r) => r.resource === "Sulfur Ore"
                        )?.total_amount || 0}
                      </p>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div className="bg-component pl-4 rounded grid grid-cols-2 md:grid-cols-4">
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_building_plan_icon.png"
                    alt="Constructions"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <Tooltip
                      content={"Total de builds réalisés avec le building plan"}
                    >
                      <p>Build</p>
                      <p>{playerData.building.totalBuildings}</p>
                    </Tooltip>
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
                    <Tooltip content={"Total de tourelles posées"}>
                      <p>Tourelle</p>
                      <p>
                        {playerData.building.deployables.find(
                          (d) => d.deployable === "Auto Turret"
                        )?.total_amount || 0}
                      </p>
                    </Tooltip>
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
                    <Tooltip content={"Total de TC posées"}>
                      <p>TC</p>
                      {playerData.building.deployables.find(
                        (d) => d.deployable === "Tool Cupboard"
                      )?.total_amount || 0}
                    </Tooltip>
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
                    <Tooltip content={"Total de sleeping bags posés"}>
                      <p>Sleeping Bag</p>
                      {playerData.building.deployables.find(
                        (d) => d.deployable === "Sleeping Bag"
                      )?.total_amount || 0}
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div className="bg-component pl-4 rounded grid grid-cols-2 md:grid-cols-4">
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_rocket_icon.png"
                    alt="Roquette"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <Tooltip content={"Total de roquettes tirées"}>
                      <p>Roquette</p>
                      <p>
                        {playerData.weapons.bullets.find(
                          (b) => b.bullet_name === "Rocket"
                        )?.total_fired || 0}
                      </p>
                    </Tooltip>
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
                    <Tooltip content={"Total de C4 posés"}>
                      <p>C4</p>
                      <p>
                        {playerData.weapons.bullets.find(
                          (b) => b.bullet_name === "Timed Explosive Charge"
                        )?.total_fired || 0}
                      </p>
                    </Tooltip>
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
                    <Tooltip content={"Total de satchels posés"}>
                      <p>Satchel</p>
                      <p>
                        {playerData.weapons.bullets.find(
                          (b) => b.bullet_name === "Satchel Charge"
                        )?.total_fired || 0}
                      </p>
                    </Tooltip>
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
                    <Tooltip content={"Total de balles explosives tirées"}>
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
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/3 flex flex-col gap-2">
              <div className="flex justify-center gap-2 p-4 rounded-[4px] bg-component h-fit">
                <div className="flex flex-col justify-center items-center">
                  <Image
                    src="/images/hit_head.png"
                    alt="Hit Head"
                    width={124}
                    height={124}
                    className={`transition-all cursor-pointer duration-200 ${
                      hoveredBodyPart === "head" ? "opacity-100" : "opacity-70"
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
                      hoveredBodyPart === "torso" ? "opacity-100" : "opacity-70"
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
                      hoveredBodyPart === "legs" ? "opacity-100" : "opacity-70"
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
                    <Tooltip
                      content={"Pourcentage de tirs mortels visant la tête"}
                    >
                      <p>Tête</p>
                      <p>
                        {(playerData.combat.hitDistribution.head * 100).toFixed(
                          1
                        )}
                        %
                      </p>
                    </Tooltip>
                  </div>
                  <div
                    className={`stat-component-row py-0 transition-opacity duration-200 ${
                      hoveredBodyPart === null || hoveredBodyPart === "torso"
                        ? "opacity-100"
                        : "opacity-30"
                    }`}
                  >
                    <Tooltip
                      content={
                        "Pourcentage de tirs mortels visant le haut du corps"
                      }
                    >
                      <p>Torse</p>
                      <p>
                        {(playerData.combat.hitDistribution.body * 100).toFixed(
                          1
                        )}
                        %
                      </p>
                    </Tooltip>
                  </div>
                  <div
                    className={`stat-component-row py-0 transition-opacity duration-200 ${
                      hoveredBodyPart === null || hoveredBodyPart === "legs"
                        ? "opacity-100"
                        : "opacity-30"
                    }`}
                  >
                    <Tooltip
                      content={
                        "Pourcentage de tirs mortels visant le bas du corps"
                      }
                    >
                      <p>Jambes</p>
                      <p>
                        {(playerData.combat.hitDistribution.legs * 100).toFixed(
                          1
                        )}
                        %
                      </p>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div className="flex lg:flex-col gap-2">
                <div className="stat-component bg-blue/40">
                  <div className="flex items-center justify-between">
                    {/* Texte à gauche */}
                    <div>
                      <Tooltip
                        content={`Joueur que ${playerData.player.name} a tué le plus de fois`}
                      >
                        <p>Cible</p>
                        {playerData.combat.favoriteTarget?.[0] ? (
                          <Link
                            href={`/stats/${playerData.combat.favoriteTarget[0].steamId}`}
                            className="link text-white"
                          >
                            {playerData.combat.favoriteTarget[0].name}
                          </Link>
                        ) : (
                          <p>Aucune</p>
                        )}
                      </Tooltip>
                    </div>

                    {/* Avatar à droite dans un Link */}
                    {playerData.combat.favoriteTarget &&
                      relatedPlayers[
                        playerData.combat.favoriteTarget[0]?.steamId
                      ] && (
                        <Link
                          href={`/stats/${playerData.combat.favoriteTarget[0].steamId}`}
                          className="ml-4 shrink-0"
                        >
                          <Image
                            src={
                              relatedPlayers[
                                playerData.combat.favoriteTarget[0].steamId
                              ] || "/images/default-avatar.png"
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
                      <Tooltip
                        content={`Joueur ayant tué ${playerData.player.name} le plus de fois`}
                      >
                        <p>Nemesis</p>
                        {playerData.combat.nemesis?.[0] ? (
                          <Link
                            href={`/stats/${playerData.combat.nemesis[0].steamId}`}
                            className="link text-white"
                          >
                            {playerData.combat.nemesis[0].name}
                          </Link>
                        ) : (
                          <p>Aucun</p>
                        )}
                      </Tooltip>
                    </div>

                    {/* Avatar à droite dans un Link */}
                    {playerData.combat.nemesis &&
                      relatedPlayers[playerData.combat.nemesis[0]?.steamId] && (
                        <Link
                          href={`/stats/$${playerData.combat.nemesis[0].steamId}`}
                          className="ml-4 shrink-0"
                        >
                          <Image
                            src={
                              relatedPlayers[
                                playerData.combat.nemesis[0].steamId
                              ]
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
          </div>
          {/* <div className="mt-6">
            <h4 className="text-white text-md mb-3">Meilleures armes</h4>
            <div className="space-y-3">
              {playerData.combat.weaponStats.map((weapon, index) => {
                // Convertir le nom de l'arme pour le nom du fichier image
                const weaponImageName = weapon.weapon
                  .toLowerCase()
                  .replace(/ /g, "_");

                // Calculer les valeurs max pour les jauges (basé sur le top 3)
                const topWeapons = playerData.combat.weaponStats.slice(0, 3);
                const maxKills = Math.max(...topWeapons.map((w) => w.kills));
                const maxAvgDistance = Math.max(
                  ...topWeapons.map((w) => w.avgDistance)
                );
                const maxMaxDistance = Math.max(
                  ...topWeapons.map((w) => w.maxDistance)
                );

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-component/50 p-3 rounded"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-component border border-text/20 rounded">
                      <Image
                        src={`/images/weapons/${weaponImageName}.png`}
                        alt={weapon.weapon}
                        width={40}
                        height={40}
                        className="object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <span className="text-white text-xl font-bold hidden">
                        ?
                      </span>
                    </div>

                    <div className="w-24 flex-shrink-0">
                      <p className="text-white text-sm font-medium">
                        {weapon.weapon}
                      </p>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-text text-xs w-8">K:</span>
                        <div className="flex-1 bg-background h-2 rounded">
                          <div
                            className="bg-red h-2 rounded transition-all duration-300"
                            style={{
                              width: `${(weapon.kills / maxKills) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-white text-xs w-8 text-right">
                          {weapon.kills}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-text text-xs w-8">Avg:</span>
                        <div className="flex-1 bg-background h-2 rounded">
                          <div
                            className="bg-yellow h-2 rounded transition-all duration-300"
                            style={{
                              width: `${
                                (weapon.avgDistance / maxAvgDistance) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-white text-xs w-8 text-right">
                          {weapon.avgDistance}m
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-text text-xs w-8">Max:</span>
                        <div className="flex-1 bg-background h-2 rounded">
                          <div
                            className="bg-green h-2 rounded transition-all duration-300"
                            style={{
                              width: `${
                                (weapon.maxDistance / maxMaxDistance) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-white text-xs w-8 text-right">
                          {weapon.maxDistance}m
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
}
