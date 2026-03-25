interface PitchDiagramProps {
  morae: string[];
  accentPosition: number; // 0 = flat (heiban), N = drop after position N
}

/**
 * Compute pitch heights for each mora.
 * Returns an array of booleans where true = high, false = low.
 *
 * Rules:
 * - First mora is always the opposite of the second mora
 * - accentPosition 0 (heiban): L H H H ... (flat, no drop)
 * - accentPosition 1 (atamadaka): H L L L ... (drop after first)
 * - accentPosition N (nakadaka/odaka): L H ... H L ... (drop after position N)
 */
function getPitchHeights(morae: string[], accentPosition: number): boolean[] {
  const len = morae.length;
  if (len === 0) return [];

  if (accentPosition === 0) {
    // Heiban: L H H H ...
    return morae.map((_, i) => i > 0);
  }

  if (accentPosition === 1) {
    // Atamadaka: H L L L ...
    return morae.map((_, i) => i === 0);
  }

  // Nakadaka / Odaka: L H ... H L ...
  // Pitch rises after first mora, drops after accentPosition
  return morae.map((_, i) => i > 0 && i < accentPosition);
}

const DOT_RADIUS = 5;
const MORA_WIDTH = 40;
const HIGH_Y = 15;
const LOW_Y = 45;
const SVG_HEIGHT = 70;
const PADDING_X = 15;

export function PitchDiagram({ morae, accentPosition }: PitchDiagramProps) {
  const heights = getPitchHeights(morae, accentPosition);
  const svgWidth = morae.length * MORA_WIDTH + PADDING_X * 2;

  const points = heights.map((high, i) => ({
    x: PADDING_X + i * MORA_WIDTH + MORA_WIDTH / 2,
    y: high ? HIGH_Y : LOW_Y,
  }));

  return (
    <div className="flex flex-col items-center">
      <svg
        width={svgWidth}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${svgWidth} ${SVG_HEIGHT}`}
        className="overflow-visible"
        aria-label={`Pitch diagram: ${morae.join("")}`}
      >
        {/* Connecting lines */}
        {points.map((point, i) => {
          if (i === 0) return null;
          const prev = points[i - 1];
          return (
            <line
              key={`line-${i}`}
              x1={prev.x}
              y1={prev.y}
              x2={point.x}
              y2={point.y}
              stroke="currentColor"
              strokeWidth={2}
              className="text-primary"
            />
          );
        })}

        {/* Dots */}
        {points.map((point, i) => (
          <circle
            key={`dot-${i}`}
            cx={point.x}
            cy={point.y}
            r={DOT_RADIUS}
            fill="currentColor"
            className="text-primary"
          />
        ))}

        {/* Mora labels */}
        {morae.map((mora, i) => (
          <text
            key={`label-${i}`}
            x={points[i].x}
            y={SVG_HEIGHT - 2}
            textAnchor="middle"
            className="fill-foreground text-sm"
            fontSize={14}
          >
            {mora}
          </text>
        ))}
      </svg>
    </div>
  );
}
