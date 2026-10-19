// Tiny SVG donut chart (no extra library). data = [{ label, value, color }]
export default function DonutChart({ data, size = 180, thickness = 22 }) {
  const r = (size - thickness) / 2, c = 2 * Math.PI * r;
  const total = data.reduce((a, d) => a + d.value, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {data.map((d) => {
          const len = (d.value / total) * c;
          const el = <circle key={d.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth={thickness} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </g>
    </svg>
  );
}
