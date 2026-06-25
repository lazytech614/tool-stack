const LEGAL = [
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="bg-white dark:bg-black/80 border-t border-zinc-200/50 dark:border-zinc-900/60 relative overflow-hidden">
      <div className="relative">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-900 dark:text-zinc-500">
            © {new Date().getFullYear()} GithubHelper. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {LEGAL.map((l) => (
              <a
                key={l.name}
                href={l.href}
                className="text-xs text-zinc-900 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-400 transition-colors"
              >
                {l.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}