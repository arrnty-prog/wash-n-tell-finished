export default function Logo({ role, style }) {
  const suffix = role === 'admin' ? 'Admin' : role === 'staff' ? 'Staff' : null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '22px 20px 18px', ...style }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#38bdf8,#2563eb)', display: 'grid', placeItems: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.5c3.5 4.2 6.5 7.6 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 10.1 8.5 6.7 12 2.5z" /></svg>
      </div>
      <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
        Wash 'N Tell{suffix && <> <span style={{ color: '#2563eb' }}>{suffix}</span></>}
      </span>
    </div>
  );
}
