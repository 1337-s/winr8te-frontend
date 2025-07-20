export default function StatsPage() {
  return (
    <div className="bg-background min-h-screen">
      <main className="parent">
        <h1>Statistiques</h1>
        <form className="flex gap-2">
          <input
            type="text"
            placeholder="Saisissez un Steam ID... (ex: 76561198012345678)"
            className="search-input"
          />
          <button className="button-primary">Rechercher</button>
        </form>
      </main>
    </div>
  );
}
