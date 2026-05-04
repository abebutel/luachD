'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYNAGOGUE_ID = 'c35cdd4c-7f74-4254-b012-16f4677fefa7'

const formatTime = (dateString: string) => {
  if (!dateString) return '--:--'
  return new Date(dateString).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function ShabbatSettings() {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [shabbatData, setShabbatData] = useState<any>(null)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch the custom note from Supabase
      const { data } = await supabase.from('synagogues').select('shabbat_note').eq('id', SYNAGOGUE_ID).single()
      if (data && data.shabbat_note) setNote(data.shabbat_note)

      // 2. Fetch the upcoming Shabbat data from Hebcal for Modi'in
      try {
        const res = await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=294200&m=50') // geonameid for Modi'in
        const hebcalJson = await res.json()
        
        // Find the Parasha, Candles, and Havdalah from the items array
        const parasha = hebcalJson.items.find((i: any) => i.category === 'parashat')?.hebrew || 'לא נמצא'
        const candles = hebcalJson.items.find((i: any) => i.category === 'candles')?.date
        const havdalah = hebcalJson.items.find((i: any) => i.category === 'havdalah')?.date

        setShabbatData({ parasha, candles, havdalah })
      } catch (err) {
        console.error("Failed to fetch Hebcal", err)
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  const saveNote = async () => {
    setSaveMessage('שומר...')
    await supabase.from('synagogues').update({ shabbat_note: note }).eq('id', SYNAGOGUE_ID)
    setSaveMessage('נשמר בהצלחה!')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  if (loading) return <p>טוען נתונים...</p>

  return (
    <div dir="rtl" style={{ maxWidth: '600px', fontFamily: 'Heebo, sans-serif' }}>
      <h1 style={{ color: '#002366', marginBottom: '20px' }}>שבת הקרובה</h1>
      <p style={{ color: '#555', marginBottom: '30px', fontSize: '1.1rem' }}>
        זמני שבת ופרשת השבוע נמשכים באופן אוטומטי מהרשת. תוכל להוסיף הערה מיוחדת (למשל: "שבת מברכים").
      </p>

      {/* Automatic Data Display */}
      {shabbatData && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px solid #dee2e6', marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.4rem', color: '#002366' }}>נתונים אוטומטיים לשבת זו:</h2>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.2rem', lineHeight: '2' }}>
            <li><strong>פרשת השבוע:</strong> {shabbatData.parasha}</li>
            <li><strong>הדלקת נרות (מודיעין):</strong> {formatTime(shabbatData.candles)}</li>
            <li><strong>צאת שבת:</strong> {formatTime(shabbatData.havdalah)}</li>
          </ul>
        </div>
      )}

      {/* Custom Note Input */}
      <div>
        <label style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', color: '#002366' }}>
          הערה מיוחדת לשבת זו (אופציונלי):
        </label>
        <input 
          type="text" 
          value={note} 
          onChange={(e) => setNote(e.target.value)}
          placeholder='למשל: שבת חתן למשפחת כהן'
          style={{ width: '100%', padding: '12px', fontSize: '1.1rem', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
        <button 
          onClick={saveNote} 
          style={{ marginTop: '20px', background: '#b38728', color: 'white', padding: '12px 25px', fontSize: '1.2rem', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}
        >
          שמור הערה
        </button>
        {saveMessage && <p style={{ textAlign: 'center', color: 'green', marginTop: '10px', fontWeight: 'bold' }}>{saveMessage}</p>}
      </div>
    </div>
  )
}