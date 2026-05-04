'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SynagogueBoard() {
  const [time, setTime] = useState(new Date())
  const [events, setEvents] = useState<string[]>([])

  // 1. Live Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 2. Fetch Approved Members for "Mazal Tov" or "Upcoming"
  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('is_approved', true)

      if (data) {
        // For the pilot, we will simply welcome all approved members.
        // Later, we will filter this strictly by date.
        const eventMessages = data.map(member => `ברוך הבא לקהילה: ${member.full_name}`)
        setEvents(eventMessages)
      }
    }
    fetchEvents()
  }, [])

  return (
    <div dir="rtl" style={{ 
      backgroundColor: '#0a192f', 
      color: '#ffffff', 
      minHeight: '100vh', 
      fontFamily: 'Heebo, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Area */}
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '30px', backgroundColor: '#020c1b', borderBottom: '4px solid #b38728' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '3rem', color: '#b38728' }}>קהילת מודיעין</h1>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#8892b0' }}>לוח זמנים והודעות</h2>
        </div>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ margin: 0, fontSize: '4rem', fontVariantNumeric: 'tabular-nums' }}>
            {time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </h1>
        </div>
      </header>

      {/* Main Content Grid */}
      <main style={{ display: 'flex', flex: 1, padding: '30px', gap: '30px' }}>
        
        {/* Right Side: Zmanim (Prayer Times) */}
        <section style={{ flex: 1, backgroundColor: '#112240', borderRadius: '15px', padding: '30px', border: '1px solid #233554' }}>
          <h2 style={{ fontSize: '2.5rem', borderBottom: '2px solid #b38728', paddingBottom: '10px', color: '#ccd6f6' }}>זמני תפילות</h2>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '2rem', lineHeight: '2' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>שחרית:</span> <span style={{ color: '#64ffda' }}>06:15</span></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>מנחה:</span> <span style={{ color: '#64ffda' }}>13:30</span></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>ערבית:</span> <span style={{ color: '#64ffda' }}>19:45</span></li>
          </ul>
        </section>

        {/* Left Side: Community Events / Ticker */}
        <section style={{ flex: 1, backgroundColor: '#112240', borderRadius: '15px', padding: '30px', border: '1px solid #233554' }}>
          <h2 style={{ fontSize: '2.5rem', borderBottom: '2px solid #b38728', paddingBottom: '10px', color: '#ccd6f6' }}>חיי הקהילה</h2>
          <div style={{ fontSize: '1.8rem', marginTop: '20px', color: '#e6f1ff' }}>
            {events.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
                {events.map((evt, idx) => (
                  <li key={idx}>🎉 {evt}</li>
                ))}
              </ul>
            ) : (
              <p>אין אירועים קרובים כרגע...</p>
            )}
          </div>
        </section>
      </main>

      {/* Footer / Scrolling Ticker Placeholder */}
      <footer style={{ backgroundColor: '#020c1b', padding: '15px', textAlign: 'center', fontSize: '1.5rem', color: '#b38728', borderTop: '2px solid #233554' }}>
        לוחD - מערכת חכמה לניהול בתי כנסת
      </footer>
    </div>
  )
}