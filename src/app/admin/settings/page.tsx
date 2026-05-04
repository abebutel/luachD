'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Default fallback in case the database is empty
const defaultSettings = {
  sunrise: true,
  sofZmanShma: true,
  minchaGedola: true,
  sunset: true,
  tzeit: true
}

export default function ZmanimSettings() {
  const [settings, setSettings] = useState<any>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('synagogues').select('zmanim_settings').eq('id', 'c35cdd4c-7f74-4254-b012-16f4677fefa7').single()
      
      // Only overwrite the defaults if we actually got data from Supabase
      if (data && data.zmanim_settings) {
        setSettings(data.zmanim_settings)
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const toggleSetting = async (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    
    // Save to database instantly
    await supabase.from('synagogues').update({ zmanim_settings: newSettings }).eq('id', 'c35cdd4c-7f74-4254-b012-16f4677fefa7')
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>טוען הגדרות...</p>

  return (
    <div dir="rtl" style={{ padding: '50px', maxWidth: '500px', margin: 'auto', fontFamily: 'Heebo, sans-serif' }}>
      <h1 style={{ color: '#002366' }}>הגדרות תצוגת זמנים</h1>
      <p>בחר אילו זמנים יופיעו על המסך בבית הכנסת:</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        {Object.keys(settings).map(key => (
          <label key={key} style={{ fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              checked={settings[key]} 
              onChange={() => toggleSetting(key)}
              style={{ width: '20px', height: '20px' }}
            />
            {key === 'sunrise' && 'נץ החמה'}
            {key === 'sofZmanShma' && 'סוף זמן ק"ש'}
            {key === 'minchaGedola' && 'מנחה גדולה'}
            {key === 'sunset' && 'שקיעה'}
            {key === 'tzeit' && 'צאת הכוכבים'}
          </label>
        ))}
      </div>
    </div>
  )
}