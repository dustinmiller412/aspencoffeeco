import {useId, useMemo} from 'react';
import {useLocation, useRouteLoaderData} from 'react-router';

const WIDTH = 1200;
const POINTS = 7;

/** Small seeded PRNG (mulberry32) so server and browser draw identical lines. */
function seededRandom(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/** Catmull-Rom spline through the points, as an SVG cubic Bézier path. */
function smoothPath(points) {
  const f = (n) => n.toFixed(1);
  let d = `M0 ${f(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const [p1, p2] = [points[i], points[i + 1]];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/**
 * Three roughly parallel contour lines. Each follows a shared random base curve,
 * offset 10 units apart with ±2 jitter, so neighbors never cross.
 */
function contourPaths(random) {
  const step = WIDTH / (POINTS - 1);
  // Points alternate above/below a midline (random phase and height) so every divider
  // has a visible wave. Base y stays within 4–36; the viewBox is 64 tall and lines add up to +22.
  const phase = random() < 0.5 ? 1 : -1;
  const base = Array.from(
    {length: POINTS},
    (_, i) => 20 + (i % 2 ? phase : -phase) * (6 + random() * 10),
  );
  return [0, 10, 20].map((offset) =>
    smoothPath(base.map((y, i) => [i * step, y + offset + (random() - 0.5) * 4])),
  );
}

/**
 * Topographic contour lines between sections (a nod to coffee grown at altitude).
 * Every divider is unique and they change on each page load: the root loader picks a
 * random seed per request, mixed with this divider's position and the page path.
 * Lines use currentColor; set the line color with text-* and the backdrop with bg-*.
 * `fillBelow` / `fillAbove` (fill-* classes) paint the adjacent section's color up to the
 * lowest / highest line, so that section's edge follows the curve.
 * @param {{className?: string, fillBelow?: string, fillAbove?: string}}
 */
export function ContourDivider({className = 'text-ink', fillBelow, fillAbove}) {
  const rootSeed = useRouteLoaderData('root')?.contourSeed ?? 1;
  const id = useId();
  const {pathname} = useLocation();

  const paths = useMemo(
    () => contourPaths(seededRandom(rootSeed ^ hashString(pathname + id))),
    [rootSeed, pathname, id],
  );

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 64"
      preserveAspectRatio="none"
      className={`block h-14 w-full ${className}`}
    >
      {fillAbove ? <path d={`${paths[0]} L1200 0 L0 0 Z`} className={fillAbove} /> : null}
      {fillBelow ? <path d={`${paths[2]} L1200 64 L0 64 Z`} className={fillBelow} /> : null}
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
