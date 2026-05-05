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

const getHebrewDayName = () => ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][new Date().getDay()]

const defaultSettings = { alotHaShachar: true, sunrise: true, sofZmanShmaMGA: true, sofZmanTfilla: true, chatzot: true, minchaGedola: true, minchaKetana: true, plagHaMincha: true, sunset: true, tzeit: true }

export default function SynagogueBoard() {
  const [time, setTime] = useState(new Date())
  const [events, setEvents] = useState<any[]>([])
  const [zmanim, setZmanim] = useState<any>({})
  const [settings, setSettings] = useState<any>(defaultSettings)
  const [prayers, setPrayers] = useState<any>({ weekday: [], shabbat: [], chagim: [] })
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [shabbatData, setShabbatData] = useState<any>(null)
  const [shabbatNote, setShabbatNote] = useState('')
  const [hebrewDate, setHebrewDate] = useState('')
  const [holidayIcon, setHolidayIcon] = useState<string | null>(null)

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
        
        const parashaItem = dataShab.items.find((i: any) => i.category === 'parashat' || (i.category === 'holiday' && i.subcat === 'shabbat'))
        setShabbatData({ 
          parasha: parashaItem ? (parashaItem.hebrew || parashaItem.title_orig) : '', 
          candles: dataShab.items.find((i: any) => i.category === 'candles')?.date, 
          havdalah: dataShab.items.find((i: any) => i.category === 'havdalah')?.date 
        })

        const holidayTitle = dataShab.items.find((i: any) => i.category === 'holiday')?.title_orig || ''
        if (holidayTitle.includes('Rosh Hashana')) setHolidayIcon('🍎🍯')
        else if (holidayTitle.includes('Yom Kippur')) setHolidayIcon('🤍🕍')
        else if (holidayTitle.includes('Sukkot')) setHolidayIcon('🍋🌿')
        else if (holidayTitle.includes('Chanukah')) setHolidayIcon('🕎🍩')
        else if (holidayTitle.includes('Purim')) setHolidayIcon('🎭🍷')
        else if (holidayTitle.includes('Pesach')) setHolidayIcon('🍷🥖')
        else if (holidayTitle.includes('Shavuot')) setHolidayIcon('📜🌾')

      } catch (error) { console.error("Failed Hebcal", error) }
    }
    fetchHebcal()
  }, [])

  useEffect(() => {
    async function fetchData() {
      const { data: synData } = await supabase.from('synagogues').select('zmanim_settings, prayer_times, announcements, shabbat_note').eq('id', SYNAGOGUE_ID).single()
      
      if (synData?.zmanim_settings) setSettings({ ...defaultSettings, ...synData.zmanim_settings })
      if (synData?.prayer_times && Array.isArray(synData.prayer_times.weekday)) setPrayers(synData.prayer_times)
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

  const FabricWave = ({ isRight }: { isRight?: boolean }) => (
    <div style={{ width: '60px', height: '100%', background: 'linear-gradient(180deg, #0A2E5C 0%, #3A6EA5 50%, #7498B5 100%)', borderLeft: isRight ? '4px solid #C5A059' : 'none', borderRight: !isRight ? '4px solid #C5A059' : 'none', boxShadow: isRight ? 'inset 10px 0 20px rgba(0,0,0,0.6)' : 'inset -10px 0 20px rgba(0,0,0,0.6)' }}>
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.2) 100%)', borderRadius: isRight ? '40% 0 0 40%' : '0 40% 40% 0' }} />
    </div>
  )

  const renderPrayerSection = (title: string, list: any[]) => {
    if (!list || list.length === 0) return null
    return (
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ color: '#3A6EA5', fontSize: '1.8rem', borderBottom: '2px solid #C5A059', paddingBottom: '5px', marginBottom: '10px', textAlign: 'center', width: '80%' }}>{title}</div>
        <div style={{ width: '90%', maxWidth: '350px' }}>
          {list.map((p: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc', padding: '5px 0' }}>
              <span>{p.name}:</span> <span>{p.time}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" style={{ backgroundColor: '#06142E', color: '#ffffff', height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', fontFamily: 'Heebo, sans-serif' }}>
      
      {/* Ticker Animation Style */}
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(-100vw); }
          100% { transform: translateX(100vw); }
        }
      `}</style>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <FabricWave isRight={true} />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 30px' }}>
          
          <header style={{ textAlign: 'right', paddingBottom: '5px' }}>
            {shabbatData?.parasha && <div style={{ fontSize: '1.6rem', color: '#F9F8F3' }}>פרשת {shabbatData.parasha}</div>}
          </header>

          <div style={{ textAlign: 'center', margin: '0 0 3vh 0' }}>
            <div style={{ fontSize: '10rem', fontWeight: 'bold', color: '#e6f1ff', textShadow: '0 0 25px #64ffda', fontVariantNumeric: 'tabular-nums', lineHeight: '1' }}>
              {time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div style={{ fontSize: '2.5rem', color: '#C5A059', marginTop: '10px' }}>יום {getHebrewDayName()}, {hebrewDate}</div>
          </div>

          <div style={{ display: 'flex', flex: 1, gap: '25px', overflow: 'hidden', paddingBottom: '15px' }}>
            
            {/* Prayers Column */}
            <section style={{ flex: 1, backgroundColor: '#F9F8F3', borderRadius: '15px', border: '3px solid #C5A059', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', position: 'relative' }}>
              <div style={{ backgroundColor: '#0B2046', color: '#F9F8F3', textAlign: 'center', padding: '15px', fontSize: '2.2rem', fontWeight: 'bold', zIndex: 2 }}>זמני תפילות</div>
              {holidayIcon && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '15rem', opacity: 0.1, zIndex: 1, pointerEvents: 'none' }}>{holidayIcon}</div>}
              <div style={{ padding: '20px 0', flex: 1, fontSize: '1.6rem', lineHeight: '2', color: '#0B2046', fontWeight: 'bold', overflowY: 'auto', zIndex: 2 }}>
                {renderPrayerSection("ימי חול", prayers.weekday)}
                {renderPrayerSection("שבת קודש", prayers.shabbat)}
                {renderPrayerSection("חגים ומועדים", prayers.chagim)}
              </div>
            </section>

            {/* Zmanim Column */}
            <section style={{ flex: 1, backgroundColor: '#F9F8F3', borderRadius: '15px', border: '3px solid #C5A059', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ backgroundColor: '#0B2046', color: '#F9F8F3', textAlign: 'center', padding: '15px', fontSize: '2.2rem', fontWeight: 'bold' }}>זמני היום</div>
              <div style={{ padding: '20px 0', flex: 1, fontSize: '1.6rem', lineHeight: '2', color: '#0B2046', fontWeight: '500', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                <div style={{ width: '90%', maxWidth: '350px' }}>
                  {settings?.alotHaShachar && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc' }}><span>עלות השחר:</span> <strong>{formatTime(zmanim.alotHaShachar)}</strong></div>}
                  {settings?.sunrise && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc' }}><span>נץ החמה:</span> <strong>{formatTime(zmanim.sunrise)}</strong></div>}
                  {settings?.sofZmanShmaMGA && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc' }}><span>סוף זמן ק"ש (מג"א):</span> <strong>{formatTime(zmanim.sofZmanShmaMGA)}</strong></div>}
                  {settings?.sofZmanTfilla && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc' }}><span>סוף זמן תפילה (גר"א):</span> <strong>{formatTime(zmanim.sofZmanTfilla)}</strong></div>}
                  {settings?.chatzot && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc' }}><span>חצות היום:</span> <strong>{formatTime(zmanim.chatzot)}</strong></div>}
                  {settings?.minchaGedola && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc' }}><span>מנחה גדולה:</span> <strong>{formatTime(zmanim.minchaGedola)}</strong></div>}
                  {settings?.minchaKetana && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc' }}><span>מנחה קטנה:</span> <strong>{formatTime(zmanim.minchaKetana)}</strong></div>}
                  {settings?.plagHaMincha && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc' }}><span>פלג המנחה:</span> <strong>{formatTime(zmanim.plagHaMincha)}</strong></div>}
                  {settings?.sunset && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc' }}><span>שקיעה:</span> <strong>{formatTime(zmanim.sunset)}</strong></div>}
                  {/* Fallback chain for Tzeit to ensure it always renders */}
                  {settings?.tzeit && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc' }}><span>צאת הכוכבים:</span> <strong>{formatTime(zmanim.tzeit7023deg || zmanim.tzeit853deg || zmanim.tzeit50min || zmanim.tzeit)}</strong></div>}
                </div>

              </div>
            </section>

            {/* Community Column */}
            <section style={{ flex: 1, backgroundColor: '#F9F8F3', borderRadius: '15px', border: '3px solid #C5A059', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ backgroundColor: '#0B2046', color: '#F9F8F3', textAlign: 'center', padding: '15px', fontSize: '2.2rem', fontWeight: 'bold' }}>חיי הקהילה</div>
              <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                {shabbatNote && <div style={{ marginBottom: '15px', padding: '15px', background: '#e3ecf5', borderRight: '4px solid #3A6EA5', borderRadius: '5px', color: '#0B2046', fontSize: '1.6rem', fontWeight: 'bold' }}>🍷 {shabbatNote}</div>}
                
                {events.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {events.map((evt: any, idx) => (
                      <li key={idx} style={{ marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                        <div style={{ color: '#0B2046', fontWeight: 'bold', fontSize: '1.5rem' }}>{evt.icon} {evt.type}: {evt.name}</div>
                        <div style={{ fontSize: '1.3rem', color: '#555' }}>{evt.hebrewDateStr} ({evt.timeText})</div>
                      </li>
                    ))}
                  </ul>
                ) : (<p style={{ color: '#777', fontSize: '1.4rem' }}>אין אירועים קרובים.</p>)}
              </div>
            </section>
          </div>
        </div>
        <FabricWave />
      </div>

      {/* Scrolling Ticker at the absolute bottom */}
      {announcements.length > 0 && (
        <div style={{ height: '60px', backgroundColor: '#0A2E5C', color: '#F9F8F3', display: 'flex', alignItems: 'center', overflow: 'hidden', borderTop: '3px solid #C5A059' }}>
          <div style={{ whiteSpace: 'nowrap', animation: 'tickerScroll 25s linear infinite', fontSize: '2rem', fontWeight: 'bold' }}>
            {announcements.map((m, i) => (
              <span key={i} style={{ margin: '0 50px' }}>🔸 {m} 🔸</span>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}