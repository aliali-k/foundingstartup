export function WavyBackground() {
  return (
    <svg
      className="fixed inset-0 -z-10 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      viewBox="0 0 1440 900"
    >
      <defs>
        <style>{`
          .w { fill: none; stroke: var(--wave); stroke-width: 1.5; }
          .a1 { animation: wave-1 10s ease-in-out infinite; }
          .a2 { animation: wave-2 12s ease-in-out infinite; }
          .a3 { animation: wave-1 8s ease-in-out infinite; }
          .a4 { animation: wave-2 14s ease-in-out infinite; }
        `}</style>
      </defs>
      <path className="w a1" d="M0,200 C360,120 720,280 1080,200 C1260,160 1380,220 1440,200" />
      <path className="w a2" d="M0,400 C360,340 720,460 1080,400 C1260,360 1380,420 1440,400" />
      <path className="w a3" d="M0,600 C360,540 720,680 1080,600 C1260,560 1380,620 1440,600" />
      <path className="w a4" d="M0,780 C360,720 720,840 1080,780 C1260,740 1380,800 1440,780" />
    </svg>
  );
}
