'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getUpcomingHebrewEvents } from '../../lib/eventlogic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const formatTime = (dateString: string) => {
  if (!dateString) return '--:--'
  const date = new Date(dateString)
  return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function SynagogueBoard() {
  const [time, setTime] = useState(new Date())
  const [events, setEvents] = useState<any[]>([])
  const [zmanim, setZmanim] = useState<any>({})
  const [settings, setSettings] = useState<any>(null) // NEW: State to hold Gabbai settings

  // 1. Live Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 2. Fetch Live Zmanim for Modi'in
  useEffect(() => {
    async function fetchZmanim() {
      try {
        const res = await fetch('https://www.hebcal.com/zmanim?cfg=json&latitude=31.8927&longitude=35.0110&tzid=Asia/Jerusalem')
        const data = await res.json()
        setZmanim(data.times)
      } catch (error) {
        console.error("Failed to fetch Zmanim", error)
      }
    }
    fetchZmanim()
  }, [])

  // 3. Fetch Data from Supabase (Members, Azkarot, AND Settings)
  useEffect(() => {
    async function fetchData() {
      // First, get the visual settings
      const { data: synData } = await supabase
        .from('synagogues')
        .select('zmanim_settings')
        .eq('id', 'c35cdd4c-7f74-4254-b012-16f4677fefa7')
        .single()
      
      if (synData) setSettings(synData.zmanim_settings)

      // Get the members
      const { data: membersData } = await supabase
        .from('members')
        .select('*')
        .eq('is_approved', true)

      // Get the active azkarot
      const { data: azkarotData } = await supabase
        .from('azkarot')
        .select('*')
        .eq('is_active', true)

      if (membersData) {
        const calculatedEvents = getUpcomingHebrewEvents(membersData, azkarotData || [])
        setEvents(calculatedEvents)
      }
    }
    fetchData()
  }, [])

  return (
    <div dir="rtl" style={{ 
      backgroundColor: '#0a192f', color: '#ffffff', minHeight: '100vh', 
      fontFamily: 'Heebo, sans-serif', display: 'flex', flexDirection: 'column'
    }}>
      {/* Header Area */}
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '30px', backgroundColor: '#020c1b', borderBottom: '4px solid #b38728' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '3rem', color: '#b38728' }}>קהילת מודיעין</h1>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#8892b0' }}>לוח זמנים והודעות</h2>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '4rem', fontVariantNumeric: 'tabular-nums' }}>
            {time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </h1>
        </div>
      </header>

      {/* Main Content Grid */}
      <main style={{ display: 'flex', flex: 1, padding: '30px', gap: '30px' }}>
        
        {/* Right Side: Zmanim (Live Prayer Times) */}
        <section style={{ flex: 1, backgroundColor: '#112240', borderRadius: '15px', padding: '30px', border: '1px solid #233554' }}>
          <h2 style={{ fontSize: '2.5rem', borderBottom: '2px solid #b38728', paddingBottom: '10px', color: '#ccd6f6' }}>זמני היום</h2>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '2rem', lineHeight: '2' }}>
            
            {/* Conditional Rendering based on Settings */}
            {settings?.sunrise && (
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>נץ החמה:</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.sunrise)}</span>
              </li>
            )}
            
            {settings?.sofZmanShma && (
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>סוף זמן ק"ש (מג"א):</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.sofZmanShmaMGA)}</span>
              </li>
            )}
            
            {settings?.minchaGedola && (
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>מנחה גדולה:</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.minchaGedola)}</span>
              </li>
            )}
            
            {settings?.sunset && (
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>שקיעה:</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.sunset)}</span>
              </li>
            )}
            
            {settings?.tzeit && (
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>צאת הכוכבים:</span> <span style={{ color: '#64ffda' }}>{formatTime(zmanim.tzeit7023deg)}</span>
              </li>
            )}

          </ul>
        </section>

        {/* Left Side: Community Events / Ticker */}
        <section style={{ flex: 1, backgroundColor: '#112240', borderRadius: '15px', padding: '30px', border: '1px solid #233554' }}>
          <h2 style={{ fontSize: '2.5rem', borderBottom: '2px solid #b38728', paddingBottom: '10px', color: '#ccd6f6' }}>חיי הקהילה</h2>
          <div style={{ fontSize: '1.8rem', marginTop: '20px', color: '#e6f1ff' }}>
            {events.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
                {events.map((evt: any, idx) => (
                  <li key={idx} style={{ marginBottom: '15px', borderBottom: '1px dashed #233554', paddingBottom: '10px' }}>
                    <div style={{ color: '#64ffda', fontWeight: 'bold' }}>
                      {evt.icon} {evt.type}: {evt.name}
                    </div>
                    <div style={{ fontSize: '1.4rem', color: '#8892b0' }}>
                      {evt.hebrewDateStr} ({evt.timeText})
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>אין אירועים קרובים כרגע...</p>
            )}
          </div>
        </section>
      </main>

      <footer style={{ backgroundColor: '#020c1b', padding: '15px', textAlign: 'center', fontSize: '1.5rem', color: '#b38728', borderTop: '2px solid #233554' }}>
        לוחD - מערכת חכמה לניהול בתי כנסת
      </footer>
    </div>
  )
}