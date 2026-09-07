/**
 * Beeldmerk uit de branding kit: drie gestapelde laagbalken.
 * - opacity 1 / 0.62 / 0.3, tenzij solid (print, favicon, app-icoon)
 * - onder 24px vervalt het woordmerk, onder 16px de derde balk
 */
export function Mark({ size = 24, color = 'var(--brand-600)', solid = false, layers = 3 }) {
  const rows = [
    { y: 3, opacity: 1 },
    { y: 10, opacity: solid ? 1 : 0.62 },
    { y: 17, opacity: solid ? 1 : 0.3 },
  ].slice(0, layers)

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }} aria-hidden="true" focusable="false">
      {rows.map((r) => (
        <rect key={r.y} x={3} y={r.y} width={18} height={4.6} rx={2.3} fill={color} opacity={r.opacity} />
      ))}
    </svg>
  )
}

/** Secundaire vorm: drie bronnen die samenkomen. Alleen groot gebruiken. */
export function Circles({ size = 44, color = 'var(--brand-600)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }} aria-hidden="true" focusable="false">
      <circle cx={12} cy={8} r={5.4} fill={color} />
      <circle cx={7.6} cy={15.6} r={5.4} fill={color} opacity={0.62} />
      <circle cx={16.4} cy={15.6} r={5.4} fill={color} opacity={0.34} />
    </svg>
  )
}

export default function Logo({ size = 22, color = 'var(--brand-600)', wordColor = 'var(--ink-900)', word = true, solid = false }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.42 }}>
      <Mark size={size * 1.34} color={color} solid={solid} />
      {word && (
        <span
          style={{
            fontSize: size * 1.02,
            fontWeight: 600,
            letterSpacing: '-0.025em',
            color: wordColor,
            lineHeight: 1,
          }}
        >
          Bundel
        </span>
      )}
    </span>
  )
}
