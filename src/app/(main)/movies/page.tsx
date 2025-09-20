export default function MoviesPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h1 className="text-3xl font-bold tracking-tight">Movies</h1>
        <p className="text-muted-foreground mt-2">
          Manage your movie collection and catalog
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">Total Movies</h3>
            <p className="text-2xl font-bold mt-2">1,234</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">New Releases</h3>
            <p className="text-2xl font-bold mt-2">45</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">Popular</h3>
            <p className="text-2xl font-bold mt-2">89</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">Genres</h3>
            <p className="text-2xl font-bold mt-2">24</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Featured Movies</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="aspect-video bg-muted rounded-md mb-3"></div>
              <h3 className="font-semibold">The Great Adventure</h3>
              <p className="text-sm text-muted-foreground">Action • 2024</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="aspect-video bg-muted rounded-md mb-3"></div>
              <h3 className="font-semibold">Mystery of Tomorrow</h3>
              <p className="text-sm text-muted-foreground">Thriller • 2024</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="aspect-video bg-muted rounded-md mb-3"></div>
              <h3 className="font-semibold">Love in the City</h3>
              <p className="text-sm text-muted-foreground">Romance • 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}