'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// --- SUB-COMPONENT: Individual Household Card ---
// This isolates the editing state so you can edit one family at a time
function HouseholdCard({ h, onRefresh }: { h: any, onRefresh: () => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: h.parent.full_name,
    phone: h.parent.phone || '',
    address: h.parent.address || '',
    birthday: h.parent.birthday || '',
    spouse_name: h.profile?.spouse_name || '',
    anniversary_date: h.profile?.anniversary_date || ''
  })

  // Save changes to Database
  const handleSave = async () => {
    setLoading(true)
    
    // Update Parent
    await supabase.from('members').update({
      full_name: formData.full_name,
      phone: formData.phone,
      address: formData.address,
      birthday: formData.birthday || null
    }).eq('id', h.parent.id)

    // Update Profile (if it exists, otherwise insert)
    if (h.profile) {
      await supabase.from('user_profiles').update({
        spouse_name: formData.spouse_name,
        anniversary_date: formData.anniversary_date || null
      }).eq('user_id', h.parent.user_id)
    } else if (h.parent.user_id) {
       await supabase.from('user_profiles').insert({
        user_id: h.parent.user_id,
        spouse_name: formData.spouse_name,
        anniversary_date: formData.anniversary_date || null
      })
    }

    setIsEditing(false)
    setLoading(false)
    onRefresh() // Reload the data
  }

  // Delete entire family (Parent, Profile, Children, Azkarot)
  const handleDeleteFamily = async () => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את משפחת ${h.parent.full_name} לצמיתות?`)) return
    
    const uid = h.parent.user_id
    if (uid) {
      await Promise.all([
        supabase.from('azkarot').delete().eq('user_id', uid),
        supabase.from('members').delete().eq('user_id', uid),
        supabase.from('user_profiles').delete().eq('user_id', uid)
      ])
    } else {
      // Fallback for ghost records without a user_id
      await supabase.from('members').delete().eq('id', h.parent.id)
    }
    onRefresh()
  }

  // Delete individual child/azkara
  const deleteChild = async (id: string) => {
    if(window.confirm('למחוק ילד זה?')) { await supabase.from('members').delete().eq('id', id); onRefresh(); }
  }
  const deleteAzkara = async (id: string) => {
    if(window.confirm('למחוק אזכרה זו?')) { await supabase.from('azkarot').delete().eq('id', id); onRefresh(); }
  }

  return (
    <div style={{ background: '#f8f9fa', borderRadius: '12px', border: '1px solid #ddd', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
      
      {/* Top Action Buttons */}
      <div style={{ position: 'absolute', top: '15px', left: '15px', display: 'flex', gap: '8px' }}>
        {isEditing ? (
          <>
            <button onClick={handleSave} disabled={loading} style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>שמור</button>
            <button onClick={() => setIsEditing(false)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>ביטול</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} style={{ background: '#002366', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>✏️ ערוך</button>
            <button onClick={handleDeleteFamily} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>🗑️ מחק</button>
          </>
        )}
      </div>

      <h2 style={{ margin: '0 0 15px 0', color: '#002366', borderBottom: '2px solid #b38728', paddingBottom: '8px', fontSize: '1.4rem' }}>
        משפחת {h.parent.full_name}
      </h2>

      {/* VIEW MODE vs EDIT MODE */}
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
          <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="שם מלא (הורה)" style={inputStyle} />
          <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="כתובת" style={inputStyle} />
          <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="טלפון" style={inputStyle} />
          <label style={labelStyle}>תאריך לידה (הורה):</label>
          <input type="date" value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} style={inputStyle} />
          <input type="text" value={formData.spouse_name} onChange={e => setFormData({...formData, spouse_name: e.target.value})} placeholder="שם בן/בת הזוג" style={inputStyle} />
          <label style={labelStyle}>תאריך נישואין:</label>
          <input type="date" value={formData.anniversary_date} onChange={e => setFormData({...formData, anniversary_date: e.target.value})} style={inputStyle} />
        </div>
      ) : (
        <div style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '15px', color: '#333' }}>
          <div>📍 <strong>כתובת:</strong> {h.parent.address || '-'}</div>
          <div>📞 <strong>טלפון:</strong> {h.parent.phone || '-'}</div>
          {h.parent.birthday && <div>🎉 <strong>יום הולדת (הורה):</strong> {h.parent.birthday}</div>}
          {h.profile?.anniversary_date && <div>💍 <strong>יום נישואין:</strong> {h.profile.anniversary_date} {h.profile.spouse_name && `(${h.profile.spouse_name})`}</div>}
        </div>
      )}

      {/* Children List */}
      {h.children.length > 0 && (
        <div style={{ marginBottom: '15px', padding: '12px', background: '#e9ecef', borderRadius: '8px' }}>
          <strong style={{ color: '#002366', fontSize: '1.1rem' }}>ילדים:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingRight: '20px', fontSize: '1.05rem', color: '#444' }}>
            {h.children.map((c: any) => (
              <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>{c.full_name} {c.birthday && `(${c.birthday})`}</span>
                {isEditing && <button onClick={() => deleteChild(c.id)} style={deleteTinyStyle}>❌</button>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Azkarot List */}
      {h.azkarot.length > 0 && (
        <div style={{ padding: '12px', background: '#fef5f5', borderLeft: '4px solid #dc3545', borderRadius: '8px' }}>
          <strong style={{ color: '#dc3545', fontSize: '1.1rem' }}>אזכרות:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingRight: '20px', fontSize: '1.05rem', color: '#444' }}>
            {h.azkarot.map((a: any) => (
              <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>{a.name} ({a.hebrew_date})</span>
                {isEditing && <button onClick={() => deleteAzkara(a.id)} style={deleteTinyStyle}>❌</button>}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}

// --- MAIN DIRECTORY COMPONENT ---
export default function AdminMembersDirectory() {
  const [households, setHouseholds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDirectory = async () => {
    setLoading(true)
    const [memRes, profRes, azkRes] = await Promise.all([
      supabase.from('members').select('*').order('full_name', { ascending: true }),
      supabase.from('user_profiles').select('*'),
      supabase.from('azkarot').select('*')
    ])

    const grouped: Record<string, any> = {}

    memRes.data?.forEach(m => {
      const uid = m.user_id || m.id 
      if (!grouped[uid]) grouped[uid] = { parent: null, children: [], profile: null, azkarot: [] }
      
      if (m.is_child === false) {
        grouped[uid].parent = m
      } else {
        grouped[uid].children.push(m)
      }
    })

    // Failsafe for ghosts
    Object.values(grouped).forEach(g => {
      if (!g.parent && g.children.length > 0) g.parent = g.children.shift()
    })

    profRes.data?.forEach(p => {
      if (grouped[p.user_id]) grouped[p.user_id].profile = p
    })

    azkRes.data?.forEach(a => {
      if (grouped[a.user_id]) grouped[a.user_id].azkarot.push(a)
    })

    const finalArray = Object.values(grouped).filter(g => g.parent != null)
    setHouseholds(finalArray)
    setLoading(false)
  }

  useEffect(() => { fetchDirectory() }, [])

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem', color: '#002366' }}>טוען נתונים...</p>

  return (
    <div dir="rtl" style={{ padding: '40px', maxWidth: '1000px', margin: 'auto', fontFamily: 'Heebo, sans-serif' }}>
      <h1 style={{ color: '#002366', marginBottom: '10px' }}>ספר הקהילה (Directory)</h1>
      <p style={{ color: '#555', marginBottom: '30px', fontSize: '1.1rem' }}>לחץ על 'ערוך' כדי לשנות פרטים או 'מחק' כדי להסיר משפחה (כולל משפחות רפאים).</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {households.map((h, i) => (
          <HouseholdCard key={i} h={h} onRefresh={fetchDirectory} />
        ))}
      </div>
    </div>
  )
}

// Styling helpers
const inputStyle = { width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' as const, fontFamily: 'Heebo, sans-serif' }
const labelStyle = { fontSize: '0.85rem', color: '#666', marginBottom: '-5px' }
const deleteTinyStyle = { background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1rem', padding: 0 }