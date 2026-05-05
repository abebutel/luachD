'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYNAGOGUE_ID = 'c35cdd4c-7f74-4254-b012-16f4677fefa7'

export default function PrayerSettings() {
  const [prayers, setPrayers] = useState<any>({ weekday: [], shabbat: [], chagim: [] })
  const [activeTab, setActiveTab] = useState('weekday')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchPrayers() {
      const { data } = await supabase.from('synagogues').select('prayer_times').eq('id', SYNAGOGUE_ID).single()
      
      // Handle data loading & upgrade old flat structure to the new array structure if needed
      if (data?.prayer_times) {
        if (Array.isArray(data.prayer_times.weekday)) {
          setPrayers(data.prayer_times)
        } else {
          // Fallback if DB still has the old flat format
          setPrayers({ weekday: [], shabbat: [], chagim: [] }) 
        }
      }
      setLoading(false)
    }
    fetchPrayers()
  }, [])

  const addRow = () => {
    const updated = { ...prayers }
    updated[activeTab].push({ name: '', time: '' })
    setPrayers(updated)
  }

  const updateRow = (index: number, field: 'name'|'time', value: string) => {
    const updated = { ...prayers }
    updated[activeTab][index][field] = value
    setPrayers(updated)
  }

  const removeRow = (index: number) => {
    const updated = { ...prayers }
    updated[activeTab].splice(index, 1)
    setPrayers(updated)
  }

  const savePrayers = async () => {
    setMessage('שומר...')
    const { error } = await supabase.from('synagogues').update({ prayer_times: prayers }).eq('id', SYNAGOGUE_ID)
    if (error) setMessage(`שגיאה: ${error.message}`)
    else {
      setMessage('נשמר בהצלחה!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>טוען...</p>

  return (
    <div dir="rtl" style={{ padding: '40px', maxWidth: '600px', margin: 'auto', fontFamily: 'Heebo, sans-serif' }}>
      <h1 style={{ color: '#002366', marginBottom: '10px' }}>עריכת זמני תפילות</h1>
      <p style={{ color: '#555', marginBottom: '20px' }}>ניתן להוסיף, למחוק ולערוך זמנים לפי קטגוריות.</p>
      
      {/* TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('weekday')} style={tabStyle(activeTab === 'weekday')}>ימי חול</button>
        <button onClick={() => setActiveTab('shabbat')} style={tabStyle(activeTab === 'shabbat')}>שבת קודש</button>
        <button onClick={() => setActiveTab('chagim')} style={tabStyle(activeTab === 'chagim')}>חגים ומועדים</button>
      </div>

      {/* DYNAMIC LIST */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px solid #ddd' }}>
        {prayers[activeTab].map((item: any, index: number) => (
          <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
            <input 
              type="text" placeholder='שם תפילה (למשל: שחרית מניין א)' value={item.name} 
              onChange={(e) => updateRow(index, 'name', e.target.value)}
              style={{ flex: 2, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <input 
              type="text" placeholder='זמן (למשל: 06:15)' value={item.time} 
              onChange={(e) => updateRow(index, 'time', e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <button onClick={() => removeRow(index)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>מחק</button>
          </div>
        ))}
        
        <button onClick={addRow} style={{ background: '#002366', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>
          + הוסף תפילה
        </button>
      </div>

      <button onClick={savePrayers} style={{ marginTop: '30px', width: '100%', background: '#b38728', color: 'white', padding: '15px', fontSize: '1.2rem', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
        שמור כל הזמנים
      </button>
      {message && <p style={{ textAlign: 'center', color: message.includes('שגיאה') ? 'red' : 'green', marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  )
}

const tabStyle = (isActive: boolean) => ({
  flex: 1, padding: '12px', fontSize: '1.1rem', cursor: 'pointer',
  background: isActive ? '#b38728' : '#e9ecef', color: isActive ? 'white' : '#333',
  border: 'none', borderRadius: '5px', fontWeight: isActive ? 'bold' : 'normal' as any
})