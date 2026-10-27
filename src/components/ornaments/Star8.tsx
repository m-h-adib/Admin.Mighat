const square = { x: 18, y: 18, size: 64 } as const;
const diamond = "50,4.75 95.25,50 50,95.25 4.75,50";

export function Star8Gem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <path
        className="fill-gold"
        d={`M${square.x} ${square.y}h${square.size}v${square.size}h-${square.size}Z`}
      />
      <polygon className="fill-gold" points={diamond} />
      <polygon className="fill-firuze" points="50,27 73,50 50,73 27,50" />
      <circle className="fill-gold-light" cx={50} cy={50} r={9} />
    </svg>
  );
}
