// app/stats/page.js
"use client";

import SearchBar from "@/components/SearchBar";

export default function StatsPage() {
  return (
    <div className="bg-background min-h-screen px-2 lg:px-0">
      <main className="parent py-12 relative z-10">
        <h1 className="mt-10">Statistiques</h1>
        <SearchBar />
      </main>
    </div>
  );
}
