export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center px-4">
        <nav className="flex gap-6">
          <a href="/" className="font-semibold text-primary-600">Home</a>
        </nav>
      </div>
    </header>
  );
}
