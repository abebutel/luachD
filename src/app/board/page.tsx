'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getUpcomingHebrewEvents } from '../../lib/eventlogic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYNAGOGUE_ID = 'c35cdd4c-7f74-4254-b012-16f4677fefa7'

const formatTime = (dateString: string) => {
  if (!dateString) return '--:--'
  return new Date(dateString).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const defaultSettings = {
  alotHaShachar: true, sunrise: true, sofZmanShmaMGA: true, sofZmanShma: true,
  chatzot: true, minchaGedola: true, minchaKetana: true, plagHaMincha: true, sunset: true, tzeit: true
}
const defaultPrayers = { shacharit: "06:00", mincha: "13:30", maariv: "20:00", shabbat_eve: "19:00", shabbat_shacharit: "08:00" }

export default function SynagogueBoard() {
  const [time, setTime] = useState(new Date())
  const [events, setEvents] = useState<any[]>([])
  const [zmanim, setZmanim] = useState<any>({})
  const [settings, setSettings] = useState<any>(defaultSettings)
  const [prayers, setPrayers] = useState<any>(defaultPrayers)
  const [announcements, setAnnouncements] = useState<string[]>([]) // NEW: Announcements state

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function fetchHebcal() {
      try {
        const res = await fetch('https://www.hebcal.com/zmanim?cfg=json&latitude=31.8927&longitude=35.0110&tzid=Asia/Jerusalem')
        const data = await res.json()
        setZmanim(data.times)
      } catch (error) { console.error("Failed Hebcal", error) }
    }
    fetchHebcal()
  }, [])

  useEffect(() => {
    async function fetchData() {
      // NEW: Also select 'announcements' from the database
      const { data: synData } = await supabase.from('synagogues').select('zmanim_settings, prayer_times, announcements').eq('id', SYNAGOGUE_ID).single()
      
      if (synData?.zmanim_settings) setSettings({ ...defaultSettings, ...synData.zmanim_settings })
      if (synData?.prayer_times) setPrayers(synData.prayer_times)
      if (synData?.announcements) setAnnouncements(synData.announcements) // NEW: Set announcements

      const { data: membersData } = await supabase.from('members').select('*').eq('is_approved', true)
      const { data: azkarotData } = await supabase.from('azkarot').select('*').eq('is_active', true)

      if (membersData) {
        setEvents(getUpcomingHebrewEvents(membersData, azkarotData || []))
      }
    }
    fetchData()
    
    // Auto-refresh data every 5 minutes so the Gabbai doesn't have to manually refresh the TV
    const dataTimer = setInterval(fetchData, 300000) 
    return () => clearInterval(dataTimer)
  }, [])

  return (
    <div dir="rtl" style={{ backgroundColor: '#0a192f', color: '#ffffff', minHeight: '100vh', fontFamily: 'Heebo, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '30px', backgroundColor: '#020c1b', borderBottom: '4px solid #b38728' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '3rem', color: '#b38728' }}>קהילת עורי צפון</h1>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#8892b0' }}>לוח זמנים והודעות</h2>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '4rem', fontVariantNumeric: 'tabular-nums' }}>
            {time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </h1>
        </div>
      </header>

      <main style={{ display: 'flex', flex: 1, padding: '30px', gap: '20px' }}>
        
        {/* COLUMN 1: LIVE ZMANIM (ASTRONOMY) */}
        <section style={{ flex: 1, backgroundColor: '#112240', borderRadius: '15px', padding: '25px', border: '1px solid #233554' }}>
          <h2 style={{ fontSize: '2rem', borderBottom: '2px solid #b38728', paddingBottom: '10px', color: '#ccd6f6' }}>זמני היום בהלכה</h2>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.6rem', lineHeight: '2' }}>
            {settings?.alotHaShachar && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>עלות השחר:</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.alotHaShachar)}</span></li>}
            {settings?.sunrise && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>נץ החמה:</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.sunrise)}</span></li>}
            {settings?.sofZmanShmaMGA && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>סוף זמן ק"ש (מג"א):</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.sofZmanShmaMGA)}</span></li>}
            {settings?.sofZmanShma && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>סוף זמן ק"ש (גר"א):</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.sofZmanShma)}</span></li>}
            {settings?.chatzot && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>חצות היום:</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.chatzot)}</span></li>}
            {settings?.minchaGedola && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>מנחה גדולה:</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.minchaGedola)}</span></li>}
            {settings?.minchaKetana && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>מנחה קטנה:</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.minchaKetana)}</span></li>}
            {settings?.plagHaMincha && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>פלג המנחה:</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.plagHaMincha)}</span></li>}
            {settings?.sunset && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>שקיעה:</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.sunset)}</span></li>}
            {settings?.tzeit && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>צאת הכוכבים:</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.tzeit7023deg)}</span></li>}
          </ul>
        </section>

        {/* COLUMN 2: PRAYER TIMES (GABBAI SETTINGS) */}
        <section style={{ flex: 1, backgroundColor: '#112240', borderRadius: '15px', padding: '25px', border: '1px solid #233554' }}>
          <h2 style={{ fontSize: '2rem', borderBottom: '2px solid #b38728', paddingBottom: '10px', color: '#ccd6f6' }}>זמני תפילות</h2>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.8rem', lineHeight: '2.5' }}>
            {prayers?.shacharit && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>שחרית:</span> <span style={{ color: '#b38728', fontWeight: 'bold' }}>{prayers.shacharit}</span></li>}
            {prayers?.mincha && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>מנחה:</span> <span style={{ color: '#b38728', fontWeight: 'bold' }}>{prayers.mincha}</span></li>}
            {prayers?.maariv && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>ערבית:</span> <span style={{ color: '#b38728', fontWeight: 'bold' }}>{prayers.maariv}</span></li>}
            <hr style={{ borderColor: '#233554', margin: '20px 0' }} />
            <div style={{ fontSize: '1.5rem', color: '#8892b0', marginBottom: '10px' }}>שבת קודש</div>
            {prayers?.shabbat_eve && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>מנחה / קבלת שבת:</span> <span style={{ color: '#b38728', fontWeight: 'bold' }}>{prayers.shabbat_eve}</span></li>}
            {prayers?.shabbat_shacharit && <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>שחרית של שבת:</span> <span style={{ color: '#b38728', fontWeight: 'bold' }}>{prayers.shabbat_shacharit}</span></li>}
          </ul>
        </section>

        {/* COLUMN 3: COMMUNITY EVENTS & ANNOUNCEMENTS */}
        <section style={{ flex: 1, backgroundColor: '#112240', borderRadius: '15px', padding: '25px', border: '1px solid #233554', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '2rem', borderBottom: '2px solid #b38728', paddingBottom: '10px', color: '#ccd6f6' }}>חיי הקהילה</h2>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* ANNOUNCEMENTS BLOCK (Only shows if there are announcements) */}
            {announcements.length > 0 && (
              <div style={{ backgroundColor: '#1d2d50', padding: '15px', borderRadius: '10px', marginTop: '20px', borderRight: '4px solid #b38728' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#b38728', fontSize: '1.4rem' }}>הודעות הקהילה:</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', color: '#fff', fontSize: '1.4rem', lineHeight: '1.6' }}>
                  {announcements.map((msg, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>🔸 {msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* BIRTHDAYS AND AZKAROT */}
            <div style={{ fontSize: '1.6rem', marginTop: '20px', color: '#e6f1ff' }}>
              {events.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.6' }}>
                  {events.map((evt: any, idx) => (
                    <li key={idx} style={{ marginBottom: '15px', borderBottom: '1px dashed #233554', paddingBottom: '10px' }}>
                      <div style={{ color: '#64ffda', fontWeight: 'bold' }}>{evt.icon} {evt.type}: {evt.name}</div>
                      <div style={{ fontSize: '1.3rem', color: '#8892b0' }}>{evt.hebrewDateStr} ({evt.timeText})</div>
                    </li>
                  ))}
                </ul>
              ) : (<p style={{ marginTop: '20px' }}>אין אירועים קרובים כרגע...</p>)}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}