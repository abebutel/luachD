'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminMembersDirectory() {
  const [households, setHouseholds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDirectory() {
      const [memRes, profRes, azkRes] = await Promise.all([
        supabase.from('members').select('*').order('full_name', { ascending: true }),
        supabase.from('user_profiles').select('*'),
        supabase.from('azkarot').select('*')
      ])

      const grouped: Record<string, any> = {}

      // Group parents and children by user_id
      memRes.data?.forEach(m => {
        const uid = m.user_id || m.id // Fallback for old manual entries
        if (!grouped[uid]) grouped[uid] = { parent: null, children: [], profile: null, azkarot: [] }
        
        // Failsafe: Explicitly group parents vs children
        if (m.is_child === false) {
          grouped[uid].parent = m
        } else {
          grouped[uid].children.push(m)
        }
      })

      // Failsafe: If a group has no designated parent, promote the first record to parent
      Object.values(grouped).forEach(g => {
        if (!g.parent && g.children.length > 0) {
          g.parent = g.children.shift()
        }
      })

      // Attach Profiles (Anniversaries)
      profRes.data?.forEach(p => {
        if (grouped[p.user_id]) grouped[p.user_id].profile = p
      })

      // Attach Azkarot
      azkRes.data?.forEach(a => {
        if (grouped[a.user_id]) grouped[a.user_id].azkarot.push(a)
      })

      // Convert to array and filter out empty ghosts
      const finalArray = Object.values(grouped).filter(g => g.parent != null)
      setHouseholds(finalArray)
      setLoading(false)
    }
    fetchDirectory()
  }, [])

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem', color: '#002366' }}>טוען ספר קהילה...</p>

  if (households.length === 0 && !loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem', color: '#555' }}>לא נמצאו משפחות במערכת. ודא שהרצת את קוד ה-SQL לפתיחת הרשאות הקריאה.</p>
  }

  return (
    <div dir="rtl" style={{ padding: '40px', maxWidth: '1000px', margin: 'auto', fontFamily: 'Heebo, sans-serif' }}>
      <h1 style={{ color: '#002366', marginBottom: '10px' }}>ספר הקהילה (Directory)</h1>
      <p style={{ color: '#555', marginBottom: '30px', fontSize: '1.1rem' }}>תצוגה מרוכזת של כל משפחות הקהילה, כולל ימי הולדת, ימי נישואין ואזכרות.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {households.map((h, i) => (
          <div key={i} style={{ background: '#f8f9fa', borderRadius: '12px', border: '1px solid #ddd', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            
            {/* Contact Info */}
            <h2 style={{ margin: '0 0 15px 0', color: '#002366', borderBottom: '2px solid #b38728', paddingBottom: '8px', fontSize: '1.4rem' }}>
              משפחת {h.parent.full_name}
            </h2>
            <div style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '15px', color: '#333' }}>
              <div>📍 <strong>כתובת:</strong> {h.parent.address || '-'}</div>
              <div>📞 <strong>טלפון:</strong> {h.parent.phone || '-'}</div>
              {h.parent.birthday && <div>🎉 <strong>יום הולדת (הורה):</strong> {h.parent.birthday}</div>}
              {h.profile?.anniversary_date && <div>💍 <strong>יום נישואין:</strong> {h.profile.anniversary_date} {h.profile.spouse_name && `(${h.profile.spouse_name})`}</div>}
            </div>

            {/* Children */}
            {h.children.length > 0 && (
              <div style={{ marginBottom: '15px', padding: '12px', background: '#e9ecef', borderRadius: '8px' }}>
                <strong style={{ color: '#002366', fontSize: '1.1rem' }}>ילדים:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingRight: '20px', fontSize: '1.05rem', color: '#444' }}>
                  {h.children.map((c: any) => <li key={c.id}>{c.full_name} {c.birthday && `(${c.birthday})`}</li>)}
                </ul>
              </div>
            )}

            {/* Azkarot */}
            {h.azkarot.length > 0 && (
              <div style={{ padding: '12px', background: '#fef5f5', borderLeft: '4px solid #dc3545', borderRadius: '8px' }}>
                <strong style={{ color: '#dc3545', fontSize: '1.1rem' }}>אזכרות:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingRight: '20px', fontSize: '1.05rem', color: '#444' }}>
                  {h.azkarot.map((a: any) => <li key={a.id}>{a.name} ({a.hebrew_date})</li>)}
                </ul>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  )
}