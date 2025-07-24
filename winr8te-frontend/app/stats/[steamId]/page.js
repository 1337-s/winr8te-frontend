// app/stats/[steamId]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Tooltip from "@/components/Tooltip";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PlayerStatsPage() {
  const params = useParams();
  const { steamId } = params;
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredBodyPart, setHoveredBodyPart] = useState(null);
  const [showAllWeapons, setShowAllWeapons] = useState(false);

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

              <span className="text-text text-sm -mt-2 lg:-mt-2 z-10">
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
                    <p>{playerData.combat.kdRatio}</p>
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
              <div className="bg-component pl-4 rounded grid grid-cols-2 md:grid-cols-4">
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_chicken_icon.png"
                    alt="Poule"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <Tooltip content={"Total de poules tuées"}>
                      <p>Poule</p>
                      <p>
                        {playerData.combat.animalKillTypes.find(
                          (a) => a.animal === "CHICKEN"
                        )?.total || 0}
                      </p>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_stag_icon.png"
                    alt="Cerf"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <Tooltip content={"Total de cerfs tués"}>
                      <p>Cerf</p>
                      <p>
                        {playerData.combat.animalKillTypes.find(
                          (a) => a.animal === "STAG"
                        )?.total || 0}
                      </p>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_boar_icon.png"
                    alt="Sanglier"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <Tooltip content={"Total de sangliers tués"}>
                      <p>Sanglier</p>
                      <p>
                        {playerData.combat.animalKillTypes.find(
                          (a) => a.animal === "BOAR"
                        )?.total || 0}
                      </p>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_bear_icon.png"
                    alt="Ours"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <Tooltip content={"Total d'ours tués"}>
                      <p>Ours</p>
                      <p>
                        {playerData.combat.animalKillTypes.find(
                          (a) => a.animal === "BEAR"
                        )?.total || 0}
                      </p>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_polar_bear_icon.png"
                    alt="Ours"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <Tooltip content={"Total d'ours polaires tués"}>
                      <p>Ours polaire</p>
                      <p>
                        {playerData.combat.animalKillTypes.find(
                          (a) => a.animal === "POLARBEAR"
                        )?.total || 0}
                      </p>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Image
                    src="/images/w8_scientist_icon.png"
                    alt="Scientifique"
                    width={32}
                    height={32}
                  />
                  <div className="stat-component-row">
                    <Tooltip
                      content={
                        "Total de scientifiques tués (scientists, heavy scientists, tunnels dwellers, underwater dwellers)"
                      }
                    >
                      <p>Scientifique</p>
                      <p>{playerData.combat.pveKills}</p>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/3 flex flex-col gap-2">
              <div className="flex justify-center gap-2 p-7 rounded-[4px] bg-component h-fit">
                <div className="flex flex-col justify-center items-center">
                  <Image
                    src="/images/hit_head.png"
                    alt="Hit Head"
                    width={126}
                    height={126}
                    className={`transition-all cursor-pointer duration-200 ${
                      hoveredBodyPart === "head" ? "opacity-100" : "opacity-70"
                    }`}
                    onMouseEnter={() => setHoveredBodyPart("head")}
                    onMouseLeave={() => setHoveredBodyPart(null)}
                  />
                  <Image
                    src="/images/hit_torso.png"
                    alt="Hit Torso"
                    width={126}
                    height={126}
                    className={`transition-all cursor-pointer duration-200 ${
                      hoveredBodyPart === "torso" ? "opacity-100" : "opacity-70"
                    }`}
                    onMouseEnter={() => setHoveredBodyPart("torso")}
                    onMouseLeave={() => setHoveredBodyPart(null)}
                  />
                  <Image
                    src="/images/hit_legs.png"
                    alt="Hit Legs"
                    width={126}
                    height={126}
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
                <div className="stat-component py-3 bg-blue/40">
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
                            className="link text-white text-sm"
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
                            width={48}
                            height={48}
                          />
                        </Link>
                      )}
                  </div>
                </div>
                <div className="stat-component py-3 bg-red/30">
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
                            className="link text-white text-sm"
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
                            width={48}
                            height={48}
                          />
                        </Link>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {playerData?.combat?.weaponStats && (
            <div className="mt-4">
              <h4 className="text-text mb-2 text-sm">Statistiques des armes</h4>

              <div className="bg-component rounded-t-[4px] overflow-hidden">
                {/* En-tête */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border-b border-text/20 text-text text-xs">
                  <div>Arme</div>
                  <div className="text-center">Kills</div>
                  <div className="text-center hidden sm:block">Dist. Moy.</div>
                  <div className="text-center hidden sm:block">Dist. Max.</div>
                </div>

                {/* Visible Weapons */}
                {(showAllWeapons
                  ? playerData.combat.weaponStats
                  : playerData.combat.weaponStats.slice(0, 5)
                ).map((weapon, index) => {
                  const weaponImageName = weapon.weapon
                    .toLowerCase()
                    .replace(/ /g, "_");

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 py-2 items-center border-b border-text/20 last:border-b-0 hover:bg-text/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-background rounded border border-text/20">
                          <Image
                            src={`/images/weapons/${weaponImageName}.png`}
                            alt={weapon.weapon}
                            width={32}
                            height={32}
                            className="object-contain"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "block";
                            }}
                          />
                          <span className="text-text text-xs hidden">?</span>
                        </div>
                        <span className="text-text text-sm">
                          {weapon.weapon}
                        </span>
                      </div>

                      <div className="text-center text-white text-sm">
                        {weapon.kills}
                      </div>
                      <div className="text-center text-white text-sm hidden sm:block">
                        {weapon.avgDistance}m
                      </div>
                      <div className="text-center text-white text-sm hidden sm:block">
                        {weapon.maxDistance}m
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Voir plus / Voir moins */}
              {playerData.combat.weaponStats.length > 5 && (
                <div className="bg-component border-t border-text/10 flex justify-center items-center p-2 rounded-b-[4px]">
                  <button
                    onClick={() => setShowAllWeapons((prev) => !prev)}
                    className="text-text text-sm flex items-center gap-1 hover:underline"
                  >
                    {showAllWeapons ? (
                      <>
                        <ChevronUp size={16} strokeWidth={2} />
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} strokeWidth={2} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
