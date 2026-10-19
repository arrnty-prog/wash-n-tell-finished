// Colored notice box (e.g. the purple "Stock Count Policy" box)
export default function InfoBox({ title, children, color = '#7c3aed', bg = '#f3e8ff' }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 10, padding: 14, marginTop: 16 }}>
      <div style={{ color, fontWeight: 700, fontSize: 11, letterSpacing: 0.5 }}>{title}</div>
      <div style={{ color, fontSize: 12, marginTop: 4 }}>{children}</div>
    </div>
  );
}
