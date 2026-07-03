import { useEffect, useRef, useState, useMemo } from "react";
import { BRANCH_PLANETS, type BranchPlanet } from "@/lib/branch-planets";

const SCENE_W = 1600;
const SCENE_H = 720;
const CX = 800;
const CY = 360;
const ORBIT_RX0 = 120;
const ORBIT_STEP = 46;
const ORBIT_RATIO = 0.42;
const BASE_SPEED = 26; // sec for innermost
const SPEED_STEP = 5;

function orbitPath(rx: number, ry: number) {
  return `M ${CX - rx},${CY} a ${rx},${ry} 0 1,0 ${rx * 2},0 a ${rx},${ry} 0 1,0 ${-rx * 2},0 Z`;
}

type OrbitMeta = {
  planet: BranchPlanet;
  rx: number;
  ry: number;
  path: string;
  duration: number;
  labelY: number;
  delay: number;
};

function useOrbits(): OrbitMeta[] {
  return useMemo(
    () =>
      BRANCH_PLANETS.map((p, i) => {
        const rx = ORBIT_RX0 + p.orbitIndex * ORBIT_STEP;
        const ry = rx * ORBIT_RATIO;
        return {
          planet: p,
          rx,
          ry,
          path: orbitPath(rx, ry),
          duration: BASE_SPEED + p.orbitIndex * SPEED_STEP,
          labelY: CY - ry - 6,
          // spread starting phase around each orbit (each planet 27% further along)
          delay: -((BASE_SPEED + p.orbitIndex * SPEED_STEP) * ((i * 0.27) % 1)),
        };
      }),
    [],
  );
}

type Stars = Array<{ x: number; y: number; s: number; o: number; d: number; t: number }>;

function useStars(): Stars {
  return useMemo(() => {
    // deterministic pseudo-random so SSR & CSR match
    const rand = mulberry32(0xa5f01c);
    const out: Stars = [];
    for (let i = 0; i < 110; i++) {
      out.push({
        x: rand() * 100,
        y: rand() * 100,
        s: 0.5 + rand() * 1.8,
        o: 0.25 + rand() * 0.75,
        d: 2 + rand() * 4,
        t: -rand() * 6,
      });
    }
    return out;
  }, []);
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function BranchSolarSystem() {
  const orbits = useOrbits();
  const stars = useStars();
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneWrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const el = sceneWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const sx = rect.width / SCENE_W;
      const sy = rect.height / SCENE_H;
      setScale(Math.max(0.2, Math.min(sx, sy)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 flex h-full w-full flex-col overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 45% 42%, color-mix(in oklab, var(--sun-glow-2) 18%, transparent), transparent 55%), linear-gradient(180deg, var(--space-bg) 0%, var(--space-bg-2) 100%)",
      }}
    >
      {/* Starfield */}
      <div className="pointer-events-none absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            className="twinkle absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.s}px`,
              height: `${s.s}px`,
              background: "var(--star-color)",
              opacity: s.o,
              boxShadow: `0 0 ${s.s * 2}px var(--star-color)`,
              animation: `twinkle ${s.d}s ease-in-out ${s.t}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Comets */}
      <Comet variant="a" duration={28} delay={0} top="0%" left="0%" />
      <Comet variant="b" duration={36} delay={-14} top="0%" left="0%" />
      <Comet variant="c" duration={22} delay={-6} top="0%" left="0%" />

      {/* Corner title */}
      <div className="pointer-events-none absolute top-4 left-4 z-10 md:top-8 md:left-8">
        <div className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--muted-foreground)]">
          ◆ Choose your orbit
        </div>
        <div
          className="mt-1 font-black uppercase leading-[0.9] tracking-tight text-[color:var(--foreground)]"
          style={{ fontSize: "clamp(1.4rem, 3.4vw, 2.6rem)", letterSpacing: "-0.02em" }}
        >
          Engineering
          <br />
          <span className="text-[color:var(--sun-glow-1)]">Universe</span>
        </div>
      </div>

      {/* Scene (orbits + planets) — takes flex-1, legend below */}
      <div
        ref={sceneWrapRef}
        className="relative flex flex-1 items-center justify-center px-2"
        style={{ minHeight: 0 }}
      >
        <div
          className="pointer-events-auto relative"
          style={{
            width: SCENE_W,
            height: SCENE_H,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {/* SVG: orbit paths + labels + sun glow */}
          <svg
            className="absolute inset-0"
            viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
            width={SCENE_W}
            height={SCENE_H}
            aria-hidden
          >
            <defs>
              {orbits.map((o, i) => (
                <path key={i} id={`orbit-${i}`} d={o.path} />
              ))}
              <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--sun-core)" stopOpacity="1" />
                <stop offset="35%" stopColor="var(--sun-glow-1)" stopOpacity="0.95" />
                <stop offset="70%" stopColor="var(--sun-glow-2)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--sun-glow-2)" stopOpacity="0" />
              </radialGradient>
            </defs>

            {orbits.map((o, i) => {
              const isHot = hovered === o.planet.slug;
              return (
                <g key={i}>
                  <use
                    href={`#orbit-${i}`}
                    fill="none"
                    stroke={isHot ? "var(--sun-glow-1)" : "var(--orbit-line)"}
                    strokeWidth={isHot ? 1.4 : 0.7}
                    style={{
                      transition: "stroke 200ms, stroke-width 200ms",
                      filter: isHot
                        ? "drop-shadow(0 0 6px var(--sun-glow-1))"
                        : "none",
                    }}
                  />
                  <text
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fontSize="9"
                    fontWeight={600}
                    letterSpacing="2.4"
                    fill={isHot ? "var(--foreground)" : "var(--orbit-label)"}
                    textAnchor="middle"
                    style={{ transition: "fill 200ms" }}
                  >
                    <textPath href={`#orbit-${i}`} startOffset={`${((75 + i * 7.7) % 100).toFixed(2)}%`}>
                      {o.planet.short}
                    </textPath>
                  </text>
                </g>
              );
            })}

            {/* Sun glow (SVG under HTML sun) */}
            <circle cx={CX} cy={CY} r={95} fill="url(#sunGrad)" opacity={0.75} />
          </svg>

          {/* Sun core */}
          <div
            className="sun-pulse absolute z-10"
            style={{
              left: CX,
              top: CY,
              width: 58,
              height: 58,
              transform: "translate(-50%, -50%)",
              borderRadius: "9999px",
              background:
                "radial-gradient(circle at 40% 40%, var(--sun-core) 0%, var(--sun-glow-1) 55%, var(--sun-glow-2) 90%, transparent 100%)",
              boxShadow:
                "0 0 40px var(--sun-glow-1), 0 0 90px var(--sun-glow-2)",
              animation: "sun-pulse 6s ease-in-out infinite",
            }}
          />

          {/* Planets */}
          {orbits.map((o) => (
            <PlanetOnOrbit
              key={o.planet.code}
              orbit={o}
              hovered={hovered === o.planet.slug}
              onEnter={() => setHovered(o.planet.slug)}
              onLeave={() => setHovered((h) => (h === o.planet.slug ? null : h))}
            />
          ))}
        </div>
      </div>

      {/* Legend row — spans full width, larger planet icons */}
      <div className="pointer-events-auto relative z-20 mx-auto w-full px-4 pb-6 md:px-8">
        <div className="flex w-full items-start justify-between gap-1 sm:gap-2">
          {BRANCH_PLANETS.map((p) => {
            const active = hovered === p.slug;
            return (
              <a
                key={p.code}
                href="#upload"
                onMouseEnter={() => setHovered(p.slug)}
                onMouseLeave={() =>
                  setHovered((h) => (h === p.slug ? null : h))
                }
                className="group flex flex-1 flex-col items-center gap-1.5 transition-transform"
                style={{ transform: active ? "translateY(-4px)" : undefined }}
                title={p.name}
              >
                <div
                  className="relative overflow-hidden rounded-full border transition-all"
                  style={{
                    width: "clamp(48px, 5.2vw, 78px)",
                    aspectRatio: "1 / 1",
                    borderColor: active
                      ? p.accent
                      : "color-mix(in oklab, var(--foreground) 22%, transparent)",
                    boxShadow: active
                      ? `0 0 26px ${p.accent}, inset 0 0 14px rgba(0,0,0,0.6)`
                      : `0 0 0 1px rgba(0,0,0,0.6) inset`,
                  }}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    width={120}
                    height={120}
                    className="h-full w-full scale-[1.05] object-cover"
                    style={{ objectPosition: "center" }}
                  />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{
                    color: active
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {p.short}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Scroll cue — sits below legend, never overlaps orbit labels */}
      <a
        href="#upload"
        className="pointer-events-auto relative z-20 mx-auto mb-4 flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.35em] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--foreground)]"
      >
        {/* <span>Scroll to upload</span>
        <span
          className="text-lg"
          style={{ animation: "scroll-cue 1.6s ease-in-out infinite" }}
        >
          ↓
        </span> */}
      </a>

      {/* Tooltip */}
      {hovered && <PlanetTooltip slug={hovered} />}
    </div>
  );
}

function PlanetOnOrbit({
  orbit,
  hovered,
  onEnter,
  onLeave,
}: {
  orbit: OrbitMeta;
  hovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const p = orbit.planet;
  const size = p.size;
  return (
    <div
      className="planet-orbit absolute"
      style={
        {
          left: 0,
          top: 0,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          offsetPath: `path("${orbit.path}")`,
          offsetRotate: "0deg",
          offsetAnchor: "center",
          animation: `orbit-travel ${orbit.duration}s linear ${orbit.delay}s infinite`,
          willChange: "offset-distance",
          zIndex: 5,
        } as React.CSSProperties
      }
    >
      <button
        type="button"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        aria-label={p.name}
        className="pointer-events-auto relative block h-full w-full cursor-pointer rounded-full transition-transform"
        style={{
          transform: hovered ? "scale(1.35)" : "scale(1)",
          transitionDuration: "220ms",
        }}
      >
        {/* Ring (behind planet) */}
        {p.ring && (
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2"
            style={{
              width: size * 2.2,
              height: size * 0.5,
              transform: `translate(-50%, -50%) rotate(${p.ring.tilt}deg)`,
              borderRadius: "9999px",
              border: `${Math.max(1.5, size * 0.045)}px solid ${p.ring.color}`,
              boxShadow: `0 0 12px ${p.ring.color}, inset 0 0 6px ${p.ring.color}`,
              opacity: 0.9,
            }}
          />
        )}
        {/* Planet body */}
        <span
          aria-hidden
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{
            boxShadow: hovered
              ? `0 0 ${size * 0.9}px ${p.accent}, inset -${size * 0.15}px -${size * 0.15}px ${size * 0.35}px rgba(0,0,0,0.7)`
              : `0 0 ${size * 0.55}px ${p.accent}, inset -${size * 0.12}px -${size * 0.12}px ${size * 0.3}px rgba(0,0,0,0.65)`,
            transition: "box-shadow 220ms",
          }}
        >
          <img
            src={p.image}
            alt=""
            loading="lazy"
            width={size * 2}
            height={size * 2}
            className="h-full w-full object-cover"
            style={{ transform: "scale(1.05)" }}
            draggable={false}
          />
        </span>
      </button>
    </div>
  );
}

function Comet({
  variant,
  duration,
  delay,
  top,
  left,
}: {
  variant: "a" | "b" | "c";
  duration: number;
  delay: number;
  top: string;
  left: string;
}) {
  const anim = `comet-drift-${variant}`;
  return (
    <div
      aria-hidden
      className="comet pointer-events-none absolute"
      style={{
        top,
        left,
        width: 220,
        height: 2,
        animation: `${anim} ${duration}s linear ${delay}s infinite`,
        opacity: 0.9,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--comet-color) 30%, transparent) 50%, var(--comet-color) 100%)`,
          filter: "blur(0.5px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: -3,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--comet-color)",
          boxShadow: "0 0 12px var(--comet-color), 0 0 24px var(--comet-color)",
        }}
      />
    </div>
  );
}

function PlanetTooltip({ slug }: { slug: string }) {
  const p = BRANCH_PLANETS.find((b) => b.slug === slug);
  if (!p) return null;
  return (
    <div
      className="pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-md border px-4 py-2 text-center backdrop-blur"
      style={{
        borderColor: "color-mix(in oklab, var(--foreground) 25%, transparent)",
        background: "color-mix(in oklab, var(--background) 82%, transparent)",
        boxShadow: `0 0 30px ${p.accent}55`,
        maxWidth: "min(90vw, 420px)",
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-[0.28em]"
        style={{ color: p.accent }}
      >
        {p.short}
      </div>
      <div className="mt-0.5 text-sm font-bold text-[color:var(--foreground)]">
        {p.name}
      </div>
      <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">
        {p.blurb}
      </div>
    </div>
  );
}



// import { useEffect, useRef, useState, useMemo } from "react";
// import { BRANCH_PLANETS, type BranchPlanet } from "@/lib/branch-planets";

// const SCENE_W = 1600;
// const SCENE_H = 720;
// const CX = 800;
// const CY = 360;
// const ORBIT_RX0 = 120;
// const ORBIT_STEP = 46;
// const ORBIT_RATIO = 0.42;
// const BASE_SPEED = 26; // sec for innermost
// const SPEED_STEP = 5;

// function orbitPath(rx: number, ry: number) {
//   return `M ${CX - rx},${CY} a ${rx},${ry} 0 1,0 ${rx * 2},0 a ${rx},${ry} 0 1,0 ${-rx * 2},0 Z`;
// }

// type OrbitMeta = {
//   planet: BranchPlanet;
//   rx: number;
//   ry: number;
//   path: string;
//   duration: number;
//   labelY: number;
//   delay: number;
// };

// function useOrbits(): OrbitMeta[] {
//   return useMemo(
//     () =>
//       BRANCH_PLANETS.map((p, i) => {
//         const rx = ORBIT_RX0 + p.orbitIndex * ORBIT_STEP;
//         const ry = rx * ORBIT_RATIO;
//         return {
//           planet: p,
//           rx,
//           ry,
//           path: orbitPath(rx, ry),
//           duration: BASE_SPEED + p.orbitIndex * SPEED_STEP,
//           labelY: CY - ry - 6,
//           // spread starting phase around each orbit (each planet 27% further along)
//           delay: -((BASE_SPEED + p.orbitIndex * SPEED_STEP) * ((i * 0.27) % 1)),
//         };
//       }),
//     [],
//   );
// }

// type Stars = Array<{ x: number; y: number; s: number; o: number; d: number; t: number }>;

// function useStars(): Stars {
//   return useMemo(() => {
//     // deterministic pseudo-random so SSR & CSR match
//     const rand = mulberry32(0xa5f01c);
//     const out: Stars = [];
//     for (let i = 0; i < 110; i++) {
//       out.push({
//         x: rand() * 100,
//         y: rand() * 100,
//         s: 0.5 + rand() * 1.8,
//         o: 0.25 + rand() * 0.75,
//         d: 2 + rand() * 4,
//         t: -rand() * 6,
//       });
//     }
//     return out;
//   }, []);
// }

// function mulberry32(seed: number) {
//   let a = seed >>> 0;
//   return function () {
//     a |= 0;
//     a = (a + 0x6d2b79f5) | 0;
//     let t = Math.imul(a ^ (a >>> 15), 1 | a);
//     t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
//     return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
//   };
// }

// export function BranchSolarSystem() {
//   const orbits = useOrbits();
//   const stars = useStars();
//   const rootRef = useRef<HTMLDivElement>(null);
//   const sceneWrapRef = useRef<HTMLDivElement>(null);
//   const [scale, setScale] = useState(1);
//   const [hovered, setHovered] = useState<string | null>(null);

//   useEffect(() => {
//     const el = sceneWrapRef.current;
//     if (!el) return;
//     const ro = new ResizeObserver(() => {
//       const rect = el.getBoundingClientRect();
//       const sx = rect.width / SCENE_W;
//       const sy = rect.height / SCENE_H;
//       setScale(Math.max(0.2, Math.min(sx, sy)));
//     });
//     ro.observe(el);
//     return () => ro.disconnect();
//   }, []);

//   return (
//     <div
//       ref={rootRef}
//       className="pointer-events-none absolute inset-0 flex h-full w-full flex-col overflow-hidden"
//       style={{
//         backgroundImage:
//           "radial-gradient(ellipse at 45% 42%, color-mix(in oklab, var(--sun-glow-2) 18%, transparent), transparent 55%), linear-gradient(180deg, var(--space-bg) 0%, var(--space-bg-2) 100%)",
//       }}
//     >
//       {/* Starfield */}
//       <div className="pointer-events-none absolute inset-0">
//         {stars.map((s, i) => (
//           <span
//             key={i}
//             className="twinkle absolute rounded-full"
//             style={{
//               left: `${s.x}%`,
//               top: `${s.y}%`,
//               width: `${s.s}px`,
//               height: `${s.s}px`,
//               background: "var(--star-color)",
//               opacity: s.o,
//               boxShadow: `0 0 ${s.s * 2}px var(--star-color)`,
//               animation: `twinkle ${s.d}s ease-in-out ${s.t}s infinite`,
//             }}
//           />
//         ))}
//       </div>

//       {/* Comets */}
//       <Comet variant="a" duration={28} delay={0} top="0%" left="0%" />
//       <Comet variant="b" duration={36} delay={-14} top="0%" left="0%" />
//       <Comet variant="c" duration={22} delay={-6} top="0%" left="0%" />

//       {/* Corner title */}
//       <div className="pointer-events-none absolute top-4 left-4 z-10 md:top-8 md:left-8">
//         <div className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--muted-foreground)]">
//           ◆ Choose your orbit
//         </div>
//         <div
//           className="mt-1 font-black uppercase leading-[0.9] tracking-tight text-[color:var(--foreground)]"
//           style={{ fontSize: "clamp(1.4rem, 3.4vw, 2.6rem)", letterSpacing: "-0.02em" }}
//         >
//           Engineering
//           <br />
//           <span className="text-[color:var(--sun-glow-1)]">Universe</span>
//         </div>
//       </div>

//       {/* Scene (orbits + planets) — takes flex-1, legend below */}
//       <div
//         ref={sceneWrapRef}
//         className="relative flex flex-1 items-center justify-center px-2"
//         style={{ minHeight: 0 }}
//       >
//         <div
//           className="pointer-events-auto relative"
//           style={{
//             width: SCENE_W,
//             height: SCENE_H,
//             transform: `scale(${scale})`,
//             transformOrigin: "center center",
//           }}
//         >
//           {/* SVG: orbit paths + labels + sun glow */}
//           <svg
//             className="absolute inset-0"
//             viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
//             width={SCENE_W}
//             height={SCENE_H}
//             aria-hidden
//           >
//             <defs>
//               {orbits.map((o, i) => (
//                 <path key={i} id={`orbit-${i}`} d={o.path} />
//               ))}
//               <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
//                 <stop offset="0%" stopColor="var(--sun-core)" stopOpacity="1" />
//                 <stop offset="35%" stopColor="var(--sun-glow-1)" stopOpacity="0.95" />
//                 <stop offset="70%" stopColor="var(--sun-glow-2)" stopOpacity="0.4" />
//                 <stop offset="100%" stopColor="var(--sun-glow-2)" stopOpacity="0" />
//               </radialGradient>
//             </defs>

//             {orbits.map((o, i) => {
//               const isHot = hovered === o.planet.slug;
//               return (
//                 <g key={i}>
//                   <use
//                     href={`#orbit-${i}`}
//                     fill="none"
//                     stroke={isHot ? "var(--sun-glow-1)" : "var(--orbit-line)"}
//                     strokeWidth={isHot ? 1.4 : 0.7}
//                     style={{
//                       transition: "stroke 200ms, stroke-width 200ms",
//                       filter: isHot
//                         ? "drop-shadow(0 0 6px var(--sun-glow-1))"
//                         : "none",
//                     }}
//                   />
//                   <text
//                     fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
//                     fontSize="9"
//                     fontWeight={600}
//                     letterSpacing="2.4"
//                     fill={isHot ? "var(--foreground)" : "var(--orbit-label)"}
//                     textAnchor="middle"
//                     style={{ transition: "fill 200ms" }}
//                   >
//                     <textPath href={`#orbit-${i}`} startOffset={`${((75 + i * 7.7) % 100).toFixed(2)}%`}>
//                       {o.planet.short}
//                     </textPath>
//                   </text>
//                 </g>
//               );
//             })}

//             {/* Sun glow (SVG under HTML sun) */}
//             <circle cx={CX} cy={CY} r={95} fill="url(#sunGrad)" opacity={0.75} />
//           </svg>

//           {/* Sun core */}
//           <div
//             className="sun-pulse absolute z-10"
//             style={{
//               left: CX,
//               top: CY,
//               width: 58,
//               height: 58,
//               transform: "translate(-50%, -50%)",
//               borderRadius: "9999px",
//               background:
//                 "radial-gradient(circle at 40% 40%, var(--sun-core) 0%, var(--sun-glow-1) 55%, var(--sun-glow-2) 90%, transparent 100%)",
//               boxShadow:
//                 "0 0 40px var(--sun-glow-1), 0 0 90px var(--sun-glow-2)",
//               animation: "sun-pulse 6s ease-in-out infinite",
//             }}
//           />

//           {/* Planets */}
//           {orbits.map((o) => (
//             <PlanetOnOrbit
//               key={o.planet.code}
//               orbit={o}
//               hovered={hovered === o.planet.slug}
//               onEnter={() => setHovered(o.planet.slug)}
//               onLeave={() => setHovered((h) => (h === o.planet.slug ? null : h))}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Legend row — spans full width, larger planet icons */}
//       <div className="pointer-events-auto relative z-20 mx-auto w-full px-4 pb-6 md:px-8">
//         <div className="flex w-full items-start justify-between gap-1 sm:gap-2">
//           {BRANCH_PLANETS.map((p) => {
//             const active = hovered === p.slug;
//             return (
//               <a
//                 key={p.code}
//                 href="#upload"
//                 onMouseEnter={() => setHovered(p.slug)}
//                 onMouseLeave={() =>
//                   setHovered((h) => (h === p.slug ? null : h))
//                 }
//                 className="group flex flex-1 flex-col items-center gap-1.5 transition-transform"
//                 style={{ transform: active ? "translateY(-4px)" : undefined }}
//                 title={p.name}
//               >
//                 <div
//                   className="relative overflow-hidden rounded-full border transition-all"
//                   style={{
//                     width: "clamp(48px, 5.2vw, 78px)",
//                     aspectRatio: "1 / 1",
//                     borderColor: active
//                       ? p.accent
//                       : "color-mix(in oklab, var(--foreground) 22%, transparent)",
//                     boxShadow: active
//                       ? `0 0 26px ${p.accent}, inset 0 0 14px rgba(0,0,0,0.6)`
//                       : `0 0 0 1px rgba(0,0,0,0.6) inset`,
//                   }}
//                 >
//                   <img
//                     src={p.image}
//                     alt={p.name}
//                     loading="lazy"
//                     width={120}
//                     height={120}
//                     className="h-full w-full scale-[1.05] object-cover"
//                     style={{ objectPosition: "center" }}
//                   />
//                 </div>
//                 <span
//                   className="text-[10px] font-bold uppercase tracking-[0.18em]"
//                   style={{
//                     color: active
//                       ? "var(--foreground)"
//                       : "var(--muted-foreground)",
//                   }}
//                 >
//                   {p.short}
//                 </span>
//               </a>
//             );
//           })}
//         </div>
//       </div>

//       {/* Scroll cue — sits below legend, never overlaps orbit labels */}
//       <a
//         href="#upload"
//         className="pointer-events-auto relative z-20 mx-auto mb-4 flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.35em] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--foreground)]"
//       >
//         {/* <span>Scroll to upload</span>
//         <span
//           className="text-lg"
//           style={{ animation: "scroll-cue 1.6s ease-in-out infinite" }}
//         >
//           ↓
//         </span> */}
//       </a>

//       {/* Tooltip */}
//       {hovered && <PlanetTooltip slug={hovered} />}
//     </div>
//   );
// }

// function PlanetOnOrbit({
//   orbit,
//   hovered,
//   onEnter,
//   onLeave,
// }: {
//   orbit: OrbitMeta;
//   hovered: boolean;
//   onEnter: () => void;
//   onLeave: () => void;
// }) {
//   const p = orbit.planet;
//   const [pressed, setPressed] = useState(false);
//   const size = p.size;
//   return (
//     <div
//       className="planet-orbit absolute"
//       style={
//         {
//           left: 0,
//           top: 0,
//           width: size,
//           height: size,
//           marginLeft: -size / 2,
//           marginTop: -size / 2,
//           offsetPath: `path("${orbit.path}")`,
//           offsetRotate: "0deg",
//           offsetAnchor: "center",
//           animation: `orbit-travel ${orbit.duration}s linear ${orbit.delay}s infinite`,
//           willChange: "offset-distance",
//           zIndex: 5,
//         } as React.CSSProperties
//       }
//     >
//       <button
//         type="button"
//         onMouseEnter={onEnter}
//         onMouseLeave={() => { onLeave(); setPressed(false); }}
//         onMouseDown={() => setPressed(true)}
//         onMouseUp={() => setPressed(false)}
//         onFocus={onEnter}
//         onBlur={onLeave}
//         aria-label={p.name}
//         className="pointer-events-auto relative block h-full w-full cursor-pointer rounded-full transition-transform"
//         style={{
//           transform: pressed ? "scale(2)" : hovered ? "scale(1.35)" : "scale(1)",
//           transitionDuration: "220ms",
//         }}
//       >
//         {/* Ring (behind planet) */}
//         {p.ring && (
//           <span
//             aria-hidden
//             className="absolute left-1/2 top-1/2"
//             style={{
//               width: size * 2.2,
//               height: size * 0.5,
//               transform: `translate(-50%, -50%) rotate(${p.ring.tilt}deg)`,
//               borderRadius: "9999px",
//               border: `${Math.max(1.5, size * 0.045)}px solid ${p.ring.color}`,
//               boxShadow: `0 0 12px ${p.ring.color}, inset 0 0 6px ${p.ring.color}`,
//               opacity: 0.9,
//             }}
//           />
//         )}
//         {/* Planet body */}
//         <span
//           aria-hidden
//           className="absolute inset-0 overflow-hidden rounded-full"
//           style={{
//             boxShadow: hovered
//               ? `0 0 ${size * 0.9}px ${p.accent}, inset -${size * 0.15}px -${size * 0.15}px ${size * 0.35}px rgba(0,0,0,0.7)`
//               : `0 0 ${size * 0.55}px ${p.accent}, inset -${size * 0.12}px -${size * 0.12}px ${size * 0.3}px rgba(0,0,0,0.65)`,
//             transition: "box-shadow 220ms",
//           }}
//         >
//           <img
//             src={p.image}
//             alt=""
//             loading="lazy"
//             width={size * 2}
//             height={size * 2}
//             className="h-full w-full object-cover"
//             style={{ transform: "scale(1.05)" }}
//             draggable={false}
//           />
//         </span>
//       </button>
//     </div>
//   );
// }

// function Comet({
//   variant,
//   duration,
//   delay,
//   top,
//   left,
// }: {
//   variant: "a" | "b" | "c";
//   duration: number;
//   delay: number;
//   top: string;
//   left: string;
// }) {
//   const anim = `comet-drift-${variant}`;
//   return (
//     <div
//       aria-hidden
//       className="comet pointer-events-none absolute"
//       style={{
//         top,
//         left,
//         width: 220,
//         height: 2,
//         animation: `${anim} ${duration}s linear ${delay}s infinite`,
//         opacity: 0.9,
//       }}
//     >
//       <div
//         style={{
//           width: "100%",
//           height: "100%",
//           background: `linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--comet-color) 30%, transparent) 50%, var(--comet-color) 100%)`,
//           filter: "blur(0.5px)",
//         }}
//       />
//       <div
//         style={{
//           position: "absolute",
//           right: 0,
//           top: -3,
//           width: 8,
//           height: 8,
//           borderRadius: "50%",
//           background: "var(--comet-color)",
//           boxShadow: "0 0 12px var(--comet-color), 0 0 24px var(--comet-color)",
//         }}
//       />
//     </div>
//   );
// }

// function PlanetTooltip({ slug }: { slug: string }) {
//   const p = BRANCH_PLANETS.find((b) => b.slug === slug);
//   if (!p) return null;
//   return (
//     <div
//       className="pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-md border px-4 py-2 text-center backdrop-blur"
//       style={{
//         borderColor: "color-mix(in oklab, var(--foreground) 25%, transparent)",
//         background: "color-mix(in oklab, var(--background) 82%, transparent)",
//         boxShadow: `0 0 30px ${p.accent}55`,
//         maxWidth: "min(90vw, 420px)",
//       }}
//     >
//       <div
//         className="text-[10px] font-bold uppercase tracking-[0.28em]"
//         style={{ color: p.accent }}
//       >
//         {p.short}
//       </div>
//       <div className="mt-0.5 text-sm font-bold text-[color:var(--foreground)]">
//         {p.name}
//       </div>
//       <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">
//         {p.blurb}
//       </div>
//     </div>
//   );
// }
