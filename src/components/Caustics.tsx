export function Caustics() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Undă de caustici — lumina care trece prin apa, SVG abstract */}
      <svg
        className="caustic absolute -top-10 left-0 h-[120%] w-[130%] opacity-60"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="causticGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1495e9" stopOpacity="0" />
            <stop offset="45%" stopColor="#7bbde9" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#a5d2f2" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1495e9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M-100,600 C200,400 350,700 600,500 C850,300 1000,650 1300,450 L1300,900 L-100,900 Z"
          fill="url(#causticGrad)"
        />
        <path
          d="M-100,650 C250,480 420,720 650,540 C880,360 1050,690 1300,500 L1300,900 L-100,900 Z"
          fill="url(#causticGrad)"
          opacity="0.6"
        />
      </svg>
      {/* strat secundar, mai lent */}
      <svg
        className="caustic absolute -top-10 left-0 h-[120%] w-[130%] opacity-40"
        style={{ animationDuration: "22s", animationDirection: "reverse" }}
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M-100,700 C300,520 480,780 700,580 C920,380 1100,740 1300,560 L1300,900 L-100,900 Z"
          fill="#a5d2f2"
          opacity="0.25"
        />
      </svg>
    </div>
  );
}
