'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYNAGOGUE_ID = 'c35cdd4c-7f74-4254-b012-16f4677fefa7'

export default function MobileBoard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: synData } = await supabase.from('synagogues').select('*').eq('id', SYNAGOGUE_ID).single()
      setData(synData)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>טוען נתונים...</div>

  return (
    <div style={{ padding: '20px', paddingBottom: '90px' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h1 style={{ color: '#0A2E5C', margin: '0 0 5px 0', fontSize: '2rem' }}>קהילת עורי צפון</h1>
        <p style={{ color: '#3A6EA5', margin: 0, fontSize: '1.2rem' }}>לוח זמנים אישי</p>
      </header>

      {/* Announcements Card */}
      {data?.announcements && data.announcements.length > 0 && (
        <div style={{ backgroundColor: '#fdf7e3', borderRight: '4px solid #C5A059', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#8c7322' }}>📢 הודעות קהילה</h3>
          <ul style={{ paddingRight: '20px', margin: 0, color: '#8c7322' }}>
            {data.announcements.map((m: string, i: number) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {/* Prayers Card */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#0A2E5C', borderBottom: '2px solid #F0F4F8', paddingBottom: '10px', marginTop: 0 }}>זמני תפילות</h2>
        
        {data?.prayer_times?.weekday && data.prayer_times.weekday.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#3A6EA5' }}>ימי חול:</strong>
            {data.prayer_times.weekday.map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span>{p.name}</span> <strong>{p.time}</strong>
              </div>
            ))}
          </div>
        )}

        {data?.prayer_times?.shabbat && data.prayer_times.shabbat.length > 0 && (
          <div>
            <strong style={{ color: '#3A6EA5' }}>שבת קודש:</strong>
            {data.prayer_times.shabbat.map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span>{p.name}</span> <strong>{p.time}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shabbat Note Card */}
      {data?.shabbat_note && (
        <div style={{ backgroundColor: '#e3ecf5', borderRight: '4px solid #3A6EA5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong style={{ color: '#0A2E5C' }}>🍷 הערת שבת: </strong> 
          <span style={{ color: '#0A2E5C' }}>{data.shabbat_note}</span>
        </div>
      )}

    </div>
  )
}