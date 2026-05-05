'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYNAGOGUE_ID = 'c35cdd4c-7f74-4254-b012-16f4677fefa7'

const defaultSettings = {
  alotHaShachar: true, sunrise: true, sofZmanShmaMGA: true, sofZmanShma: true,
  chatzot: true, minchaGedola: true, minchaKetana: true, plagHaMincha: true, sunset: true, tzeit: true
}

export default function ZmanimSettings() {
  const [settings, setSettings] = useState<any>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('synagogues').select('zmanim_settings').eq('id', SYNAGOGUE_ID).single()
      if (data && data.zmanim_settings) setSettings({ ...defaultSettings, ...data.zmanim_settings })
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const toggleSetting = async (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    await supabase.from('synagogues').update({ zmanim_settings: newSettings }).eq('id', SYNAGOGUE_ID)
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>טוען הגדרות...</p>

  const zmanimLabels: Record<string, string> = {
    alotHaShachar: 'עלות השחר', sunrise: 'נץ החמה', sofZmanShmaMGA: 'סוף זמן ק"ש (מג"א)',
    sofZmanShma: 'סוף זמן ק"ש (גר"א)', chatzot: 'חצות היום', minchaGedola: 'מנחה גדולה',
    minchaKetana: 'מנחה קטנה', plagHaMincha: 'פלג המנחה', sunset: 'שקיעה', tzeit: 'צאת הכוכבים'
  }

  return (
    <div dir="rtl" style={{ padding: '50px', maxWidth: '500px', margin: 'auto', fontFamily: 'Heebo, sans-serif' }}>
      <h1 style={{ color: '#002366' }}>הגדרות תצוגת זמנים</h1>
      <p>בחר אילו זמנים יופיעו על המסך בבית הכנסת:</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
        {Object.keys(zmanimLabels).map(key => (
          <label key={key} style={{ fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" checked={settings[key]} onChange={() => toggleSetting(key)}
              style={{ width: '20px', height: '20px' }}
            />
            {zmanimLabels[key]}
          </label>
        ))}
      </div>
    </div>
  )
}