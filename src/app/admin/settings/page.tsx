'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ZmanimSettings() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('synagogues').select('zmanim_settings').eq('id', 1).single()
      if (data) setSettings(data.zmanim_settings)
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const toggleSetting = async (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    await supabase.from('synagogues').update({ zmanim_settings: newSettings }).eq('id', 1)
  }

  if (loading) return <p>טוען הגדרות...</p>

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