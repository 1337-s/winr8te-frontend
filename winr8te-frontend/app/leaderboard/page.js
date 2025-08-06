"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

const LEADERBOARD_CONFIGS = {
  pvp: {
    title: "PvP",
    endpoint: "/leaderboard/pvp",
    description: "Classement PvP",
    color: "red",
    image: "/images/leaderboards/PVPLeaderboard.gif",
    hasSubOptions: true,
    subOptions: [
      {
        key: "kills",
        label: "Kills",
        mainStat: "kills",
        secondaryStats: ["deaths", "kdRatio"],
      },
      {
        key: "deaths",
        label: "Deaths",
        mainStat: "totalDeaths",
        secondaryStats: ["totalKills", "kdRatio"],
        endpoint: "/leaderboard/deaths",
      },
    ],
  },
  pve: {
    title: "PvE",
    endpoint: "/leaderboard/pve",
    description: "Scientifiques, animaux, bradley, heli",
    mainStat: "totalPveKills",
    secondaryStats: [
      "animalKills",
      "scientistKills",
      "bradleyKills",
      "heliKills",
    ],
    color: "yellow",
    image: "/images/leaderboards/PVELeaderboard.gif",
  },
  resources: {
    title: "Ressources",
    endpoint: "/leaderboard/resources",
    description: "Ressources récoltées",
    color: "green",
    image: "/images/leaderboards/Ress_Leaderboard.gif",

    hasSubOptions: true,
    subOptions: [
      { key: "wood", label: "Bois", mainStat: "amount", param: "Wood" },
      {
        key: "stone",
        label: "Pierre",
        mainStat: "amount",
        param: "Stones",
      },
      {
        key: "metal",
        label: "Métal",
        mainStat: "amount",
        param: "Metal Ore",
      },
      {
        key: "sulfur",
        label: "Soufre",
        mainStat: "amount",
        param: "Sulfur Ore",
      },
    ],
  },
  builders: {
    title: "Builders",
    endpoint: "/leaderboard/builders",
    description: "Total des constructions",
    mainStat: "totalConstructions",
    secondaryStats: ["totalBuildings", "totalDeployables"],
    color: "yellow",
    image: "/images/leaderboards/Build_Leaderboard.gif",
  },
  playtime: {
    title: "Temps de jeu",
    endpoint: "/leaderboard/playtime",
    description: "Temps de jeu total",
    mainStat: "playTime",
    color: "blue",
    image: "/images/leaderboards/PlayTime_Leaderboard.gif",
  },
};

const STAT_LABELS = {
  kills: "Kills",
  deaths: "Morts",
  kdRatio: "KD",
  avgDistance: "Avg. Dist",
  maxDistance: "Max Dist",
  totalDeaths: "Morts",
  totalKills: "Kills",
  totalPveKills: "Kills PVE",
  animalKills: "Animaux",
  scientistKills: "Scientifiques",
  bradleyKills: "Bradley",
  heliKills: "Hélicoptère",
  amount: "Quantité",
  totalConstructions: "Constructions",
  totalBuildings: "Build",
  totalDeployables: "Déployables",
  playTime: "Temps de jeu",
};

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

async function fetchWithCache(url) {
  const now = Date.now();
  const cached = cache.get(url);

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const result = data.leaderboard || data;
    cache.set(url, { data: result, timestamp: now });
    return result;
  } catch (error) {
    console.error(`Erreur fetch ${url}:`, error);
    return cached?.data || [];
  }
}

function PodiumAvatars({ players }) {
  const [avatars, setAvatars] = useState({});

  useEffect(() => {
    const fetchAvatars = async () => {
      const top3 = players.slice(0, 3);
      const avatarPromises = top3.map(async (player, index) => {
        try {
          const profile = await fetchWithCache(`/steam/${player.steamId}`);
          return { index, avatar: profile.avatarFull };
        } catch {
          return { index, avatar: null };
        }
      });

      const results = await Promise.allSettled(avatarPromises);
      const newAvatars = {};

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.avatar) {
          newAvatars[result.value.index] = result.value.avatar;
        }
      });

      setAvatars(newAvatars);
    };

    if (players.length > 0) {
      fetchAvatars();
    }
  }, [players]);

  return (
    <div className="flex justify-center items-end gap-4 mb-6">
      {players.slice(0, 3).map((player, index) => {
        return (
          <div key={player.steamId}>
            <div>
              {avatars[index] ? (
                <Image
                  src={avatars[index]}
                  alt={player.name}
                  width={64}
                  height={64}
                />
              ) : (
                <div
                  className={`${
                    index === 1 ? "w-16 h-16" : "w-12 h-12"
                  }  bg-component flex items-center justify-center`}
                >
                  <span className="text-text text-xs">?</span>
                </div>
              )}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow rounded-full flex items-center justify-center text-background text-xs font-bold">
                {index + 1}
              </div>
            </div>
            <Link
              href={`/stats/${player.steamId}`}
              className="text-white text-xs hover:text-yellow transition-colors mt-1 text-center max-w-16 truncate"
            >
              {player.name}
            </Link>
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardRow({ player, rank, config, subOption }) {
  const formatValue = (value, stat) => {
    if (stat === "playTime" && typeof value === "string") {
      return value;
    }
    if (stat === "kdRatio") {
      return typeof value === "number" ? value.toFixed(1) : value;
    }
    if (typeof value === "string" && !isNaN(value)) {
      return parseInt(value).toLocaleString();
    }
    return value?.toLocaleString() || "0";
  };

  const mainStat = subOption?.mainStat || config.mainStat;
  const secondaryStats =
    subOption?.secondaryStats || config.secondaryStats || [];

  return (
    <Link
      href={`/stats/${player.steamId}`}
      className={`flex items-center gap-4 p-4 rounded-[4px] bg-component`}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/20">
        <span className="text-sm font-bold text-blue">{rank}</span>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate">{player.name}</h3>
        <p className="text-text text-xs truncate">{player.steamId}</p>
      </div>

      <div className="flex">
        <div className="stat-component">
          <p>{STAT_LABELS[mainStat] || mainStat}</p>
          <p className={`text-${config.color} font-bold`}>
            {formatValue(player[mainStat], mainStat)}
          </p>
        </div>
        {secondaryStats.length > 0 && (
          <div className="flex">
            {secondaryStats.map((stat) =>
              player[stat] !== undefined ? (
                <div key={stat} className="stat-component">
                  <p>{STAT_LABELS[stat] || stat}</p>
                  <p>{formatValue(player[stat], stat)}</p>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function LeaderboardSection({
  type,
  config,
  activeSubOption,
  setActiveSubOption,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let url = config.endpoint;

        if (config.hasSubOptions) {
          const subOption =
            config.subOptions.find((opt) => opt.key === activeSubOption) ||
            config.subOptions[0];

          if (subOption.endpoint) {
            url = subOption.endpoint;
          } else if (subOption.param) {
            url = `${config.endpoint}?resource=${encodeURIComponent(
              subOption.param
            )}`;
          }
        }

        const result = await fetchWithCache(url);
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [config, activeSubOption]);

  if (loading) {
    return (
      <div>
        <div>
          <div className="h-6 bg-text/20 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-text/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-component p-6 rounded">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-white">{config.title}</h2>
        </div>
        <p className="text-red text-center py-4">Erreur de chargement</p>
      </div>
    );
  }

  const currentSubOption = config.hasSubOptions
    ? config.subOptions.find((opt) => opt.key === activeSubOption) ||
      config.subOptions[0]
    : null;

  return (
    <div>
      {config.hasSubOptions && (
        <div className="flex flex-col justify-between flex-wrap gap-2 mb-4">
          <h3 className="text-text text-sm">Sous-catégories</h3>
          <div className="flex gap-2 bg-component">
            {config.subOptions.map((subOption) => (
              <button
                key={subOption.key}
                onClick={() => setActiveSubOption(subOption.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
                  activeSubOption === subOption.key
                    ? "bg-blue/70 text-white"
                    : "text-text hover:text-white hover:bg-blue/30"
                }`}
              >
                {subOption.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {config.image && (
        <div className="mb-6">
          <Image
            src={config.image}
            alt={config.title}
            width={1140}
            height={570}
            className="w-full object-cover opacity-80"
          />
        </div>
      )}

      {data.length > 0 && (
        <>
          <PodiumAvatars players={data} />
          <div className="space-y-2">
            {data.slice(3).map((player, index) => (
              <LeaderboardRow
                key={player.steamId}
                player={player}
                rank={index + 4}
                config={config}
                subOption={currentSubOption}
              />
            ))}
          </div>
        </>
      )}

      {data.length === 0 && (
        <p className="text-text text-center py-8">Aucune donnée disponible</p>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("pvp");
  const [activeSubOptions, setActiveSubOptions] = useState({
    pvp: "kills",
    resources: "wood",
  });

  const handleSubOptionChange = (tabKey, subOptionKey) => {
    setActiveSubOptions((prev) => ({
      ...prev,
      [tabKey]: subOptionKey,
    }));
  };

  return (
    <div className="bg-background min-h-screen">
      <main className="parent py-12 relative z-10">
        <div className=" mt-10 px-2 lg:px-0">
          <div>
            <h1>Leaderboards</h1>
          </div>

          <div className="flex flex-col flex-wrap justify-between mb-2">
            <h3 className="text-text text-sm ">Catégories</h3>
            <div className="flex gap-2 bg-component">
              {Object.entries(LEADERBOARD_CONFIGS).map(([key, config]) => {
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
                      activeTab === key
                        ? "bg-blue/70 text-white"
                        : "text-text hover:text-white hover:bg-blue/30"
                    }`}
                  >
                    {config.title}
                  </button>
                );
              })}
            </div>
          </div>

          <LeaderboardSection
            type={activeTab}
            config={LEADERBOARD_CONFIGS[activeTab]}
            activeSubOption={activeSubOptions[activeTab]}
            setActiveSubOption={(subOption) =>
              handleSubOptionChange(activeTab, subOption)
            }
          />
        </div>
      </main>
    </div>
  );
}
