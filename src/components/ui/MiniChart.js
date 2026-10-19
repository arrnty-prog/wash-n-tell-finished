// Tiny SVG area chart (no extra library). data = array of numbers, labels = array of strings
export default function MiniChart({ data, labels = [], color = '#2563eb', height = 140 }) {
  const w = 300, h = 100, max = Math.max(...data) * 1.15;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - (v / max) * h]);
  const line = pts.map((p) => p.join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} width="100%" height={height}>
      <polygon points={`0,${h} ${line} ${w},${h}`} fill={color} opacity="0.12" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={color} />)}
      {labels.map((l, i) => <text key={l} x={(i / (labels.length - 1)) * w} y={h + 14} fontSize="9" fill="#94a3b8" textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}>{l}</text>)}
    </svg>
  );
}
