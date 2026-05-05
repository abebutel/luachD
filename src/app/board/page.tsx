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
  return new Date(dateString).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const getHebrewDayName = () => {
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]
  return days[new Date().getDay()]
}

export default function SynagogueBoard() {
  const [time, setTime] = useState(new Date())
  const [events, setEvents] = useState<any[]>([])
  const [zmanim, setZmanim] = useState<any>({})
  const [settings, setSettings] = useState<any>({})
  const [prayers, setPrayers] = useState<any>({})
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [shabbatData, setShabbatData] = useState<any>(null)
  const [shabbatNote, setShabbatNote] = useState('')
  const [hebrewDate, setHebrewDate] = useState('')

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Hebrew Date Calculation
  useEffect(() => {
    setHebrewDate(new HDate(time).renderGematriya(true))
  }, [time])

  // Fetch Hebcal Data (Zmanim & Shabbat)
  useEffect(() => {
    async function fetchHebcal() {
      try {
        const resZmanim = await fetch('https://www.hebcal.com/zmanim?cfg=json&latitude=31.8927&longitude=35.0110&tzid=Asia/Jerusalem')
        const dataZmanim = await resZmanim.json()
        setZmanim(dataZmanim.times)

        const resShab = await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=294200&m=50')
        const dataShab = await resShab.json()
        const parasha = dataShab.items.find((i: any) => i.category === 'parashat')?.hebrew || ''
        const candles = dataShab.items.find((i: any) => i.category === 'candles')?.date
        const havdalah = dataShab.items.find((i: any) => i.category === 'havdalah')?.date
        setShabbatData({ parasha, candles, havdalah })
      } catch (error) { console.error("Failed Hebcal", error) }
    }
    fetchHebcal()
  }, [])

  // Fetch Database Logic
  useEffect(() => {
    async function fetchData() {
      const { data: synData } = await supabase.from('synagogues').select('zmanim_settings, prayer_times, announcements, shabbat_note').eq('id', SYNAGOGUE_ID).single()
      if (synData?.zmanim_settings) setSettings(synData.zmanim_settings)
      if (synData?.prayer_times) setPrayers(synData.prayer_times)
      if (synData?.shabbat_note) setShabbatNote(synData.shabbat_note)
      if (synData?.announcements) setAnnouncements(synData.announcements)

      const { data: membersData } = await supabase.from('members').select('*').eq('is_approved', true)
      const { data: azkarotData } = await supabase.from('azkarot').select('*').eq('is_active', true)
      if (membersData) setEvents(getUpcomingHebrewEvents(membersData, azkarotData || []))
    }
    fetchData()
    const dataTimer = setInterval(fetchData, 300000) 
    return () => clearInterval(dataTimer)
  }, [])

  return (
    <div dir="rtl" style={{ 
      backgroundColor: '#03122b', color: '#ffffff', 
      height: '100vh', width: '100vw', overflow: 'hidden', // Forces strict full screen, NO SCROLL
      fontFamily: 'Heebo, sans-serif', display: 'flex', boxSizing: 'border-box'
    }}>
      
      {/* RIGHT PILLAR */}
      <div style={{ width: '60px', background: 'linear-gradient(to right, #999, #fff, #999)', borderLeft: '4px solid #b38728', borderRight: '4px solid #b38728', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)', margin: '10px', borderRadius: '5px' }} />

      {/* CENTER CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          <div style={{ fontSize: '1.5rem', color: '#fff' }}>פרשת {shabbatData?.parasha || '...'}</div>
          <div style={{ fontSize: '2.5rem', color: '#b38728', fontWeight: 'bold', textShadow: '0 0 10px rgba(179, 135, 40, 0.5)' }}>לוחD</div>
          <div style={{ fontSize: '1.2rem', color: '#8892b0', border: '1px solid #b38728', padding: '5px 10px', borderRadius: '4px' }}>לוגו בית הכנסת</div>
        </header>

        {/* Giant Clock Box */}
        <div style={{ margin: '20px', padding: '30px', backgroundColor: '#071836', border: '2px solid #b38728', borderRadius: '15px', textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: '8rem', fontWeight: 'bold', color: '#e6f1ff', textShadow: '0 0 20px #64ffda', fontVariantNumeric: 'tabular-nums', lineHeight: '1' }}>
            {time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ fontSize: '2.2rem', color: '#b38728', marginTop: '10px' }}>
            יום {getHebrewDayName()}, {hebrewDate}
          </div>
          {shabbatNote && (
            <div style={{ fontSize: '1.8rem', color: '#64ffda', marginTop: '15px', fontWeight: 'bold' }}>
              {shabbatNote}
            </div>
          )}
        </div>

        {/* Three Columns Bottom Section */}
        <div style={{ display: 'flex', flex: 1, gap: '20px', padding: '0 20px', marginBottom: '10px' }}>
          
          {/* COLUMN 1: Prayers (Right side per mockup design) */}
          <section style={{ flex: 1, backgroundColor: '#ffffff', color: '#000', borderRadius: '10px', border: '3px solid #b38728', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#002366', color: '#fff', textAlign: 'center', padding: '15px', fontSize: '1.8rem', fontWeight: 'bold' }}>זמני תפילות</div>
            <div style={{ padding: '20px', flex: 1, fontSize: '1.6rem', lineHeight: '2.2' }}>
              {prayers?.shacharit && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}><span>שחרית:</span> <strong>{prayers.shacharit}</strong></div>}
              {prayers?.mincha && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}><span>מנחה:</span> <strong>{prayers.mincha}</strong></div>}
              {prayers?.maariv && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}><span>ערבית:</span> <strong>{prayers.maariv}</strong></div>}
              <div style={{ marginTop: '15px', color: '#002366', fontWeight: 'bold' }}>שבת קודש:</div>
              {prayers?.shabbat_eve && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}><span>מנחה/קבלת שבת:</span> <strong>{prayers.shabbat_eve}</strong></div>}
              {prayers?.shabbat_shacharit && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}><span>שחרית שבת:</span> <strong>{prayers.shabbat_shacharit}</strong></div>}
            </div>
          </section>

          {/* COLUMN 2: Zmanim (Center) */}
          <section style={{ flex: 1, backgroundColor: '#ffffff', color: '#000', borderRadius: '10px', border: '3px solid #b38728', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#002366', color: '#fff', textAlign: 'center', padding: '15px', fontSize: '1.8rem', fontWeight: 'bold' }}>זמני היום</div>
            <div style={{ padding: '20px', flex: 1, fontSize: '1.4rem', lineHeight: '1.8' }}>
              {settings?.alotHaShachar && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>עלות השחר:</span> <strong>{formatTime(zmanim.alotHaShachar)}</strong></div>}
              {settings?.sunrise && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>נץ החמה:</span> <strong>{formatTime(zmanim.sunrise)}</strong></div>}
              {settings?.sofZmanShmaMGA && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>סוף זמן ק"ש (מג"א):</span> <strong>{formatTime(zmanim.sofZmanShmaMGA)}</strong></div>}
              {settings?.sofZmanShma && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>סוף זמן ק"ש (גר"א):</span> <strong>{formatTime(zmanim.sofZmanShma)}</strong></div>}
              {settings?.chatzot && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>חצות היום:</span> <strong>{formatTime(zmanim.chatzot)}</strong></div>}
              {settings?.minchaGedola && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>מנחה גדולה:</span> <strong>{formatTime(zmanim.minchaGedola)}</strong></div>}
              {settings?.minchaKetana && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>מנחה קטנה:</span> <strong>{formatTime(zmanim.minchaKetana)}</strong></div>}
              {settings?.plagHaMincha && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>פלג המנחה:</span> <strong>{formatTime(zmanim.plagHaMincha)}</strong></div>}
              {settings?.sunset && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>שקיעה:</span> <strong>{formatTime(zmanim.sunset)}</strong></div>}
              {settings?.tzeit && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>צאת הכוכבים:</span> <strong>{formatTime(zmanim.tzeit7023deg)}</strong></div>}
            </div>
          </section>

          {/* COLUMN 3: Community & Announcements (Left) */}
          <section style={{ flex: 1, backgroundColor: '#ffffff', color: '#000', borderRadius: '10px', border: '3px solid #b38728', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#002366', color: '#fff', textAlign: 'center', padding: '15px', fontSize: '1.8rem', fontWeight: 'bold' }}>חיי הקהילה</div>
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              {announcements.length > 0 && (
                <div style={{ marginBottom: '15px', padding: '10px', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '5px' }}>
                  <strong style={{ color: '#856404' }}>הודעות:</strong>
                  <ul style={{ paddingRight: '20px', margin: '5px 0 0 0', color: '#856404' }}>
                    {announcements.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}
              {events.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {events.map((evt: any, idx) => (
                    <li key={idx} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                      <div style={{ color: '#002366', fontWeight: 'bold', fontSize: '1.3rem' }}>{evt.icon} {evt.type}: {evt.name}</div>
                      <div style={{ fontSize: '1.1rem', color: '#555' }}>{evt.hebrewDateStr} ({evt.timeText})</div>
                    </li>
                  ))}
                </ul>
              ) : (<p style={{ color: '#555' }}>אין אירועים קרובים.</p>)}
            </div>
          </section>

        </div>
      </div>

      {/* LEFT PILLAR */}
      <div style={{ width: '60px', background: 'linear-gradient(to right, #999, #fff, #999)', borderLeft: '4px solid #b38728', borderRight: '4px solid #b38728', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)', margin: '10px', borderRadius: '5px' }} />

    </div>
  )
}