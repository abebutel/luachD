'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYNAGOGUE_ID = 'c35cdd4c-7f74-4254-b012-16f4677fefa7'

export default function PrayerSettings() {
  const [prayers, setPrayers] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchPrayers() {
      const { data } = await supabase.from('synagogues').select('prayer_times').eq('id', SYNAGOGUE_ID).single()
      if (data?.prayer_times) setPrayers(data.prayer_times)
      setLoading(false)
    }
    fetchPrayers()
  }, [])

  const handleChange = (key: string, value: string) => {
    setPrayers({ ...prayers, [key]: value })
  }

  const savePrayers = async () => {
    setMessage('שומר...')
    await supabase.from('synagogues').update({ prayer_times: prayers }).eq('id', SYNAGOGUE_ID)
    setMessage('נשמר בהצלחה!')
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>טוען...</p>

  return (
    <div dir="rtl" style={{ padding: '50px', maxWidth: '500px', margin: 'auto', fontFamily: 'Heebo, sans-serif' }}>
      <h1 style={{ color: '#002366' }}>עריכת זמני תפילות</h1>
      <p>הכנס את זמני התפילות הקבועים (ניתן לכתוב טקסט חופשי, למשל "בזמן השקיעה"):</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        {['shacharit', 'mincha', 'maariv', 'shabbat_eve', 'shabbat_shacharit'].map(key => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {key === 'shacharit' ? 'שחרית (חול)' :
               key === 'mincha' ? 'מנחה (חול)' :
               key === 'maariv' ? 'ערבית (חול)' :
               key === 'shabbat_eve' ? 'מנחה / קבלת שבת' : 'שחרית (שבת)'}
            </label>
            <input 
              type="text" 
              value={prayers[key] || ''} 
              onChange={(e) => handleChange(key, e.target.value)}
              style={{ padding: '10px', fontSize: '1.2rem', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>
        ))}
      </div>

      <button onClick={savePrayers} style={{ marginTop: '20px', width: '100%', background: '#b38728', color: 'white', padding: '15px', fontSize: '1.2rem', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>
        שמור זמנים
      </button>
      {message && <p style={{ textAlign: 'center', color: 'green', marginTop: '10px' }}>{message}</p>}
    </div>
  )
}