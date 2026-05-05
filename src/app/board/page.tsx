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

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setHebrewDate(new HDate(time).renderGematriya(true))
  }, [time])

  useEffect(() => {
    async function fetchHebcal() {
      try {
        const resZmanim = await fetch('https://www.hebcal.com/zmanim?cfg=json&latitude=31.8927&longitude=35.0110&tzid=Asia/Jerusalem')
        const dataZmanim = await resZmanim.json()
        setZmanim(dataZmanim.times)

        const resShab = await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=294200&m=50')
        const dataShab = await resShab.json()
        
        // Robust Parasha logic
        const parashaItem = dataShab.items.find((i: any) => i.category === 'parashat' || (i.category === 'holiday' && i.subcat === 'shabbat'))
        const parasha = parashaItem ? (parashaItem.hebrew || parashaItem.title_orig) : 'לא נמצא'
        const candles = dataShab.items.find((i: any) => i.category === 'candles')?.date
        const havdalah = dataShab.items.find((i: any) => i.category === 'havdalah')?.date
        
        setShabbatData({ parasha, candles, havdalah })
      } catch (error) { console.error("Failed Hebcal", error) }
    }
    fetchHebcal()
  }, [])

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

  // The Sweeping Fabric Waves from the Parochet
  const FabricWave = ({ isRight }: { isRight?: boolean }) => (
    <div style={{
      width: '60px', height: '100%',
      background: 'linear-gradient(180deg, #0A2E5C 0%, #3A6EA5 50%, #7498B5 100%)',
      borderLeft: isRight ? '4px solid #C5A059' : 'none',
      borderRight: !isRight ? '4px solid #C5A059' : 'none',
      boxShadow: isRight ? 'inset 10px 0 20px rgba(0,0,0,0.6)' : 'inset -10px 0 20px rgba(0,0,0,0.6)'
    }}>
      <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.2) 100%)',
        borderRadius: isRight ? '40% 0 0 40%' : '0 40% 40% 0',
      }} />
    </div>
  )

  return (
    <div dir="rtl" style={{ 
      backgroundColor: '#06142E', // Deep Navy from Bima text
      color: '#ffffff', height: '100vh', width: '100vw', 
      overflow: 'hidden', display: 'flex', boxSizing: 'border-box', fontFamily: 'Heebo, sans-serif' 
    }}>
      
      {/* Right Fabric Wave */}
      <FabricWave isRight={true} />

      {/* Main Content Center */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 30px' }}>
        
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a335c', paddingBottom: '10px' }}>
          <div style={{ fontSize: '1.6rem', color: '#F9F8F3' }}>פרשת {shabbatData?.parasha || '...'}</div>
          <div style={{ fontSize: '3.5rem', color: '#C5A059', fontWeight: 'bold' }}>לוחD</div>
          <div style={{ fontSize: '1.6rem', color: '#F9F8F3', border: '1px solid #C5A059', padding: '5px 15px', borderRadius: '5px' }}>לוגו בית הכנסת</div>
        </header>

        {/* Center Glowing Clock */}
        <div style={{ textAlign: 'center', margin: '2vh 0' }}>
          <div style={{ fontSize: '10rem', fontWeight: 'bold', color: '#e6f1ff', textShadow: '0 0 25px #64ffda', fontVariantNumeric: 'tabular-nums', lineHeight: '1' }}>
            {time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ fontSize: '2.5rem', color: '#C5A059', marginTop: '10px' }}>
            יום {getHebrewDayName()}, {hebrewDate}
          </div>
        </div>

        {/* Three Columns Section (Mockup Layout + Ivory Colors) */}
        <div style={{ display: 'flex', flex: 1, gap: '25px', overflow: 'hidden' }}>
          
          {/* COLUMN 1: Prayers (Right side) */}
          <section style={{ flex: 1, backgroundColor: '#F9F8F3', borderRadius: '15px', border: '3px solid #C5A059', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
            <div style={{ backgroundColor: '#0B2046', color: '#F9F8F3', textAlign: 'center', padding: '15px', fontSize: '2.2rem', fontWeight: 'bold' }}>זמני תפילות</div>
            <div style={{ padding: '20px', flex: 1, fontSize: '1.8rem', lineHeight: '2.4', color: '#0B2046', fontWeight: 'bold' }}>
              {prayers?.shacharit && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dotted #ccc' }}><span>שחרית:</span> <span>{prayers.shacharit}</span></div>}
              {prayers?.mincha && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dotted #ccc' }}><span>מנחה:</span> <span>{prayers.mincha}</span></div>}
              {prayers?.maariv && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dotted #ccc' }}><span>ערבית:</span> <span>{prayers.maariv}</span></div>}
              
              <div style={{ marginTop: '20px', color: '#3A6EA5', fontSize: '1.6rem' }}>שבת קודש:</div>
              {prayers?.shabbat_eve && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dotted #ccc' }}><span>מנחה / קבלת שבת:</span> <span>{prayers.shabbat_eve}</span></div>}
              {prayers?.shabbat_shacharit && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dotted #ccc' }}><span>שחרית של שבת:</span> <span>{prayers.shabbat_shacharit}</span></div>}
            </div>
          </section>

          {/* COLUMN 2: Zmanim (Center) */}
          <section style={{ flex: 1, backgroundColor: '#F9F8F3', borderRadius: '15px', border: '3px solid #C5A059', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
            <div style={{ backgroundColor: '#0B2046', color: '#F9F8F3', textAlign: 'center', padding: '15px', fontSize: '2.2rem', fontWeight: 'bold' }}>זמני היום</div>
            <div style={{ padding: '20px', flex: 1, fontSize: '1.6rem', lineHeight: '2', color: '#0B2046', fontWeight: '500' }}>
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
          <section style={{ flex: 1, backgroundColor: '#F9F8F3', borderRadius: '15px', border: '3px solid #C5A059', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
            <div style={{ backgroundColor: '#0B2046', color: '#F9F8F3', textAlign: 'center', padding: '15px', fontSize: '2.2rem', fontWeight: 'bold' }}>חיי הקהילה</div>
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              
              {/* Special Shabbat Note */}
              {shabbatNote && (
                <div style={{ marginBottom: '15px', padding: '15px', background: '#e3ecf5', borderRight: '4px solid #3A6EA5', borderRadius: '5px', color: '#0B2046', fontSize: '1.6rem', fontWeight: 'bold' }}>
                  🍷 {shabbatNote}
                </div>
              )}

              {/* Announcements */}
              {announcements.length > 0 && (
                <div style={{ marginBottom: '15px', padding: '15px', background: '#fdf7e3', borderRight: '4px solid #C5A059', borderRadius: '5px' }}>
                  <strong style={{ color: '#8c7322', fontSize: '1.4rem' }}>הודעות קהילה:</strong>
                  <ul style={{ paddingRight: '20px', margin: '5px 0 0 0', color: '#8c7322', fontSize: '1.4rem', lineHeight: '1.6' }}>
                    {announcements.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}

              {/* Birthdays & Memorials */}
              {events.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {events.map((evt: any, idx) => (
                    <li key={idx} style={{ marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                      <div style={{ color: '#0B2046', fontWeight: 'bold', fontSize: '1.4rem' }}>{evt.icon} {evt.type}: {evt.name}</div>
                      <div style={{ fontSize: '1.2rem', color: '#555' }}>{evt.hebrewDateStr} ({evt.timeText})</div>
                    </li>
                  ))}
                </ul>
              ) : (<p style={{ color: '#777', fontSize: '1.4rem' }}>אין אירועים קרובים.</p>)}
            </div>
          </section>

        </div>
      </div>

      {/* Left Fabric Wave */}
      <FabricWave />

    </div>
  )
}