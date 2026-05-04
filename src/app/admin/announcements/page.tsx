'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYNAGOGUE_ID = 'c35cdd4c-7f74-4254-b012-16f4677fefa7'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [newText, setNewText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data } = await supabase.from('synagogues').select('announcements').eq('id', SYNAGOGUE_ID).single()
      if (data?.announcements) setAnnouncements(data.announcements)
      setLoading(false)
    }
    fetchAnnouncements()
  }, [])

  const saveToDB = async (newList: string[]) => {
    setAnnouncements(newList)
    await supabase.from('synagogues').update({ announcements: newList }).eq('id', SYNAGOGUE_ID)
  }

  const addAnnouncement = () => {
    if (!newText.trim()) return
    const newList = [...announcements, newText.trim()]
    saveToDB(newList)
    setNewText('')
  }

  const removeAnnouncement = (indexToRemove: number) => {
    const newList = announcements.filter((_, idx) => idx !== indexToRemove)
    saveToDB(newList)
  }

  if (loading) return <p>טוען הודעות...</p>

  return (
    <div dir="rtl" style={{ maxWidth: '600px' }}>
      <h1 style={{ color: '#002366', marginBottom: '20px' }}>הודעות קהילה</h1>
      <p style={{ color: '#555', marginBottom: '30px', fontSize: '1.1rem' }}>
        ההודעות שיוזנו כאן יופיעו במדור "חיי הקהילה" במסך הראשי של בית הכנסת.
      </p>

      {/* Add New Message */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        <input 
          type="text" 
          value={newText} 
          onChange={(e) => setNewText(e.target.value)}
          placeholder="כתוב הודעה חדשה... (למשל: הקידוש השבוע נתרם ע״י...)"
          style={{ flex: 1, padding: '12px', fontSize: '1.1rem', borderRadius: '5px', border: '1px solid #ccc', fontFamily: 'Heebo' }}
        />
        <button onClick={addAnnouncement} style={{ background: '#b38728', color: 'white', padding: '0 20px', fontSize: '1.1rem', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          פרסם
        </button>
      </div>

      {/* Active Messages List */}
      <div>
        <h2 style={{ fontSize: '1.4rem', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>הודעות פעילות</h2>
        {announcements.length === 0 ? (
          <p style={{ color: '#888', marginTop: '20px' }}>אין הודעות פעילות כרגע.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
            {announcements.map((msg, idx) => (
              <li key={idx} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e9ecef' }}>
                <span style={{ fontSize: '1.2rem' }}>{msg}</span>
                <button onClick={() => removeAnnouncement(idx)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>
                  מחק
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}