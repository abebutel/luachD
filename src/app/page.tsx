import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Heebo, sans-serif' }}>
      <h1 style={{ color: '#002366', fontSize: '3rem' }}>ברוכים הבאים ללוחD</h1>
      <p style={{ fontSize: '1.5rem', color: '#555' }}>פיילוט קהילת מודיעין</p>
      
      <div style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <Link href="/register" style={{ padding: '15px 30px', background: '#b38728', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '1.2rem' }}>
          רישום חברים לאפליקציה
        </Link>
        
        <Link href="/admin/approvals" style={{ padding: '15px 30px', background: '#002366', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '1.2rem' }}>
          פאנל גבאי (אישורים)
        </Link>
      </div>
    </div>
  )
}