// app/stats/page.js
"use client";

import SearchBar from "@/components/SearchBar";

export default function StatsPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="grainy-background"></div>
      <main className="parent py-8 relative z-10">
        <h1 className="mb-8">Statistiques</h1>
        <SearchBar />
      </main>
    </div>
  );
}
