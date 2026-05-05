'use client'

export default function DonatePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Heebo, sans-serif' }}>
      <h1 style={{ color: '#0A2E5C', textAlign: 'center', marginBottom: '30px' }}>תרומות לקהילה</h1>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <h2 style={{ color: '#3A6EA5', marginTop: 0 }}>תרומה באשראי / אפליקציה</h2>
        <p style={{ color: '#555', marginBottom: '20px' }}>ניתן לתרום בקלות ובמהירות דרך הקישורים הבאים:</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <a href="#" style={{ backgroundColor: '#00c6e8', color: 'white', padding: '15px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
            תרומה ב-PayBox
          </a>
          <a href="#" style={{ backgroundColor: '#003366', color: 'white', padding: '15px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
            תרומה ב-Bit
          </a>
        </div>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#3A6EA5', marginTop: 0 }}>העברה בנקאית</h2>
        <p style={{ color: '#555', marginBottom: '15px' }}>פרטי חשבון הבנק של העמותה:</p>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1.2rem', lineHeight: '1.8' }}>
          <li><strong>שם החשבון:</strong> עמותת עורי צפון</li>
          <li><strong>בנק:</strong> בנק הפועלים (12)</li>
          <li><strong>סניף:</strong> 123 (מודיעין)</li>
          <li><strong>מספר חשבון:</strong> 123456</li>
        </ul>
      </div>

    </div>
  )
}