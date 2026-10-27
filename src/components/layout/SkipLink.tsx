export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="fixed start-4 top-3 z-60 -translate-y-24 rounded-btn bg-gold px-5 py-3 font-bold text-green-950 shadow-lift-dark transition-transform duration-200 focus-visible:translate-y-0"
    >
      {label}
    </a>
  );
}
