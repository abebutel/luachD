'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getUpcomingHebrewEvents } from '../../lib/eventlogic'
import { HDate } from '@hebcal/core'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYNAGOGUE_ID = 'c35cdd4c-7f74-4254-b012-16f4677fefa7'

const formatTime = (dateString: string) => {
  if (!dateString) return '--:--'
  if (dateString.length <= 5 && dateString.includes(':')) return dateString
  try { return new Date(dateString).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false }) } 
  catch (e) { return '--:--' }
}

const defaultSettings = { alotHaShachar: true, sunrise: true, sofZmanShmaMGA: true, sofZmanTfilla: true, chatzot: true, minchaGedola: true, minchaKetana: true, plagHaMincha: true, sunset: true, tzeit: true }

export default function MobileBoard() {
  const [data, setData] = useState<any>(null)
  const [zmanim, setZmanim] = useState<any>({})
  const [shabbatData, setShabbatData] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [hebrewDate, setHebrewDate] = useState(new HDate().renderGematriya(true))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        // 1. Fetch Zmanim from Hebcal
        const resZmanim = await fetch('https://www.hebcal.com/zmanim?cfg=json&latitude=31.8927&longitude=35.0110&tzid=Asia/Jerusalem')
        const dataZmanim = await resZmanim.json()
        setZmanim(dataZmanim.times || {})

        // 2. Fetch Shabbat info
        const resShab = await fetch('https://www.hebcal.com/shabbat?cfg=json&geo=pos&latitude=31.8927&longitude=35.0110&tzid=Asia/Jerusalem&m=50&i=on')
        const dataShab = await resShab.json()
        
        let parasha = '', candles = '', havdalah = ''
        if (dataShab?.items) {
           const pItem = dataShab.items.find((i: any) => i.category === 'parashat' || i.category === 'leyning' || (i.category === 'holiday' && i.subcat === 'shabbat'))
           if (pItem) parasha = pItem.hebrew || pItem.title || ''
           const cItem = dataShab.items.find((i: any) => i.category === 'candles')
           if (cItem) candles = cItem.date || cItem.title?.match(/\d{1,2}:\d{2}/)?.[0] || ''
           const hItem = dataShab.items.find((i: any) => i.category === 'havdalah')
           if (hItem) havdalah = hItem.date || hItem.title?.match(/\d{1,2}:\d{2}/)?.[0] || ''
        }
        setShabbatData({ parasha, candles, havdalah })

        // 3. Fetch Synagogue Data (Prayers & Announcements)
        const { data: synData } = await supabase.from('synagogues').select('*').eq('id', SYNAGOGUE_ID).single()
        setData(synData)

        // 4. Fetch Community Events
        const { data: membersData } = await supabase.from('members').select('*').eq('is_approved', true)
        const { data: azkarotData } = await supabase.from('azkarot').select('*').eq('is_active', true)
        if (membersData) {
          setEvents(getUpcomingHebrewEvents(membersData, azkarotData || []))
        }

      } catch (e) { 
        console.error("Fetch error:", e) 
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#0A2E5C', fontSize: '1.2rem' }}>טוען נתונים...</div>

  // Safety parsing for prayers
  const prayers = data?.prayer_times || { weekday: [], shabbat: [], chagim: [] }
  const settings = data?.zmanim_settings || defaultSettings

  // צאת הכוכבים - תיקון מפתחות (נפוץ בישראל: 50 דקות או 8.5 מעלות)
  const tzeitTime = formatTime(zmanim.tzeit7083deg || zmanim.tzeit85deg || zmanim.tzeit50min || zmanim.tzeit)

  return (
    <div dir="rtl" style={{ padding: '15px', paddingBottom: '90px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#FAF9F4', minHeight: '100vh', fontFamily: 'Heebo, sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ textAlign: 'center', marginBottom: '20px', backgroundColor: '#FFFFFF', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #7498B5' }}>
        <h1 style={{ color: '#0A2E5C', margin: '0 0 5px 0', fontSize: '1.8rem' }}>קהילת עורי צפון</h1>
        <div style={{ color: '#3A6EA5', fontSize: '1.2rem', fontWeight: 'bold' }}>{hebrewDate}</div>
        
        {shabbatData?.parasha && (
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#0A2E5C' }}>
            <span style={{ fontWeight: 'bold' }}>{shabbatData.parasha.includes('פרשת') ? shabbatData.parasha : `פרשת ${shabbatData.parasha}`}</span>
            <span>🕯️ {formatTime(shabbatData.candles)} | 🍷 {formatTime(shabbatData.havdalah)}</span>
          </div>
        )}
      </header>

      {/* ANNOUNCEMENTS */}
      {data?.announcements && data.announcements.length > 0 && (
        <div style={{ backgroundColor: '#0A2E5C', color: '#FFFFFF', padding: '15px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px' }}>📢 הודעות קהילה</h3>
          <ul style={{ paddingRight: '20px', margin: 0, lineHeight: '1.6' }}>
            {data.announcements.map((m: string, i: number) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {/* ZMANIM */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '15px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #7498B5' }}>
        <h2 style={{ color: '#3A6EA5', borderBottom: '2px solid #F0F4F8', paddingBottom: '8px', marginTop: 0, fontSize: '1.4rem' }}>זמני היום</h2>
        <div style={{ fontSize: '1.1rem', lineHeight: '2', color: '#0A2E5C' }}>
          {settings.alotHaShachar && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f9f9f9' }}><span>עלות השחר:</span> <strong>{formatTime(zmanim.alotHaShachar)}</strong></div>}
          {settings.sunrise && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f9f9f9' }}><span>נץ החמה:</span> <strong>{formatTime(zmanim.sunrise)}</strong></div>}
          {settings.sofZmanShmaMGA && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f9f9f9' }}><span>סוף ק"ש (מג"א):</span> <strong>{formatTime(zmanim.sofZmanShmaMGA)}</strong></div>}
          {settings.sofZmanTfilla && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f9f9f9' }}><span>סוף תפילה (גר"א):</span> <strong>{formatTime(zmanim.sofZmanTfilla)}</strong></div>}
          {settings.sunset && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f9f9f9' }}><span>שקיעה:</span> <strong>{formatTime(zmanim.sunset)}</strong></div>}
          {settings.tzeit && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>צאת הכוכבים:</span> <strong>{tzeitTime}</strong></div>}
        </div>
      </div>

      {/* PRAYERS - מבנה מוקשח לוודא הצגה */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '15px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #7498B5' }}>
        <h2 style={{ color: '#3A6EA5', borderBottom: '2px solid #F0F4F8', paddingBottom: '8px', marginTop: 0, fontSize: '1.4rem' }}>זמני תפילות</h2>
        
        {prayers.weekday && prayers.weekday.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#0A2E5C', display: 'block', marginBottom: '5px', borderRight: '3px solid #3A6EA5', paddingRight: '8px' }}>ימי חול:</strong>
            {prayers.weekday.map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f9f9f9', padding: '4px 0' }}><span>{p.name}:</span> <strong>{p.time}</strong></div>
            ))}
          </div>
        )}

        {prayers.shabbat && prayers.shabbat.length > 0 && (
          <div>
            <strong style={{ color: '#0A2E5C', display: 'block', marginBottom: '5px', borderRight: '3px solid #3A6EA5', paddingRight: '8px' }}>שבת קודש:</strong>
            {prayers.shabbat.map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f9f9f9', padding: '4px 0' }}><span>{p.name}:</span> <strong>{p.time}</strong></div>
            ))}
          </div>
        )}

        {(!prayers.weekday?.length && !prayers.shabbat?.length) && <p style={{ color: '#888' }}>אין זמני תפילות מעודכנים.</p>}
      </div>

      {/* EVENTS */}
      {events.length > 0 && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #7498B5' }}>
          <h2 style={{ color: '#3A6EA5', borderBottom: '2px solid #F0F4F8', paddingBottom: '8px', marginTop: 0, fontSize: '1.4rem' }}>אירועי קהילה קרובים</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {events.map((evt: any, idx) => (
              <li key={idx} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                <div style={{ color: '#0A2E5C', fontWeight: 'bold' }}>{evt.icon} {evt.type}: {evt.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>{evt.hebrewDateStr} ({evt.timeText})</div>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}