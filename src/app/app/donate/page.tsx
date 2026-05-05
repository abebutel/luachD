'use client'
import { useState } from 'react'

export default function DonatePage() {
  const [copied, setCopied] = useState(false)

  const copyBankDetails = () => {
    const details = `שם החשבון: עמותת עורי צפון\nבנק: בנק הפועלים (12)\nסניף: 123\nמספר חשבון: 123456`
    navigator.clipboard.writeText(details)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div dir="rtl" style={{ padding: '20px', paddingBottom: '90px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Heebo, sans-serif' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '25px', backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h1 style={{ color: '#0A2E5C', margin: '0 0 10px 0', fontSize: '2rem' }}>תרומות לקהילה</h1>
        <p style={{ color: '#555', margin: 0, fontSize: '1.1rem' }}>שותפים לעשייה, מחזיקים את הקהילה.</p>
      </header>

      
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <h2 style={{ color: '#3A6EA5', marginTop: 0, fontSize: '1.5rem', marginBottom: '20px' }}>📱 תרומה מהירה באפליקציה</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <a href="[https://payboxapp.page.link/YOUR_LINK_HERE](https://links.payboxapp.com/e308WYB4JUb)" target="_blank" rel="noreferrer" style={{ backgroundColor: '#00c6e8', color: 'white', padding: '16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.3rem', boxShadow: '0 2px 4px rgba(0,198,232,0.3)' }}>
            תרומה ב- PayBox
          </a>
          <a href="[https://bitpay.co.il/YOUR_LINK_HERE](https://bitpay.co.il/YOUR_LINK_HERE)" target="_blank" rel="noreferrer" style={{ backgroundColor: '#003366', color: 'white', padding: '16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.3rem', boxShadow: '0 2px 4px rgba(0,51,102,0.3)' }}>
            תרומה ב- Bit
          </a>
        </div>
      </div>

      
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#3A6EA5', marginTop: 0, fontSize: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🏦 העברה בנקאית</span>
          <button onClick={copyBankDetails} style={{ fontSize: '0.9rem', backgroundColor: '#e3ecf5', color: '#0A2E5C', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {copied ? 'הועתק!' : 'העתק פרטים'}
          </button>
        </h2>
        
        <div style={{ backgroundColor: '#F0F4F8', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #C5A059' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1.2rem', lineHeight: '2', color: '#0A2E5C' }}>
            <li><strong>שם החשבון:</strong> עמותת קול אסתר</li>
            <li><strong>בנק:</strong> בנק מזרחי טפחות (10)</li>
            <li><strong>סניף:</strong> 571 (אור יהודה)</li>
            <li><strong>מספר חשבון:</strong> 190459</li>
          </ul>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '15px', textAlign: 'center' }}>* ניתן להעביר אישור העברה לגבאי לעדכון.</p>
      </div>

    </div>
  )
}