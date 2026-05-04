'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MemberDirectory() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // State for inline editing
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})

  // State for adding a new member
  const [isAdding, setIsAdding] = useState(false)
  const [newMember, setNewMember] = useState<any>({ full_name: '', phone: '', email: '', address: '', birthday: '' })

  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    setLoading(true)
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('is_approved', true)
      .order('full_name', { ascending: true })
    
    if (data) setMembers(data)
    setLoading(false)
  }

  // --- EDITING LOGIC ---
  const startEditing = (member: any) => {
    setEditingId(member.id)
    setEditForm(member)
    setIsAdding(false) // Close add mode if open
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const saveChanges = async () => {
    const { error } = await supabase.from('members').update(editForm).eq('id', editingId)
    if (!error) {
      setMembers(members.map(m => m.id === editingId ? editForm : m))
      setEditingId(null)
    } else {
      alert("שגיאה בשמירת הנתונים")
    }
  }

  // --- ADDING LOGIC ---
  const handleNewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMember({ ...newMember, [e.target.name]: e.target.value })
  }

  const saveNewMember = async () => {
    if (!newMember.full_name) {
      alert("חובה להזין לפחות שם מלא")
      return
    }
    
    // Force auto-approval since the Gabbai is adding them directly
    const memberToInsert = { ...newMember, is_approved: true }
    
    const { data, error } = await supabase.from('members').insert([memberToInsert]).select()
    
    if (!error && data) {
      // Add to list and sort alphabetically
      const updatedList = [...members, data[0]].sort((a, b) => a.full_name.localeCompare(b.full_name))
      setMembers(updatedList)
      setIsAdding(false)
      setNewMember({ full_name: '', phone: '', email: '', address: '', birthday: '' })
    } else {
      alert("שגיאה בהוספת החבר")
    }
  }

  if (loading) return <p>טוען נתוני חברים...</p>

  return (
    <div dir="rtl">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '20px' }}>
        <h1 style={{ color: '#002366', margin: 0 }}>ספר קהילה</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '1.2rem', color: '#8892b0' }}>
            סה"כ רשומים: <strong style={{ color: '#b38728' }}>{members.length}</strong>
          </div>
          <button 
            onClick={() => { setIsAdding(true); setEditingId(null); }} 
            style={{ background: '#b38728', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ➕ הוסף חבר חדש
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '1.1rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd', color: '#002366' }}>
              <th style={{ padding: '12px' }}>שם מלא</th>
              <th style={{ padding: '12px' }}>טלפון</th>
              <th style={{ padding: '12px' }}>אימייל</th>
              <th style={{ padding: '12px' }}>כתובת</th>
              <th style={{ padding: '12px' }}>תאריך לידה (לועזי)</th>
              <th style={{ padding: '12px' }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            
            {/* NEW MEMBER ROW (Only shows when isAdding is true) */}
            {isAdding && (
              <tr style={{ backgroundColor: '#e6f2ff', borderBottom: '2px solid #b38728' }}>
                <td style={{ padding: '10px' }}><input name="full_name" placeholder="שם מלא" value={newMember.full_name} onChange={handleNewChange} style={inputStyle} /></td>
                <td style={{ padding: '10px' }}><input name="phone" placeholder="טלפון" value={newMember.phone} onChange={handleNewChange} style={inputStyle} /></td>
                <td style={{ padding: '10px' }}><input name="email" placeholder="אימייל" value={newMember.email} onChange={handleNewChange} style={inputStyle} /></td>
                <td style={{ padding: '10px' }}><input name="address" placeholder="כתובת" value={newMember.address} onChange={handleNewChange} style={inputStyle} /></td>
                <td style={{ padding: '10px' }}><input name="birthday" type="date" value={newMember.birthday} onChange={handleNewChange} style={inputStyle} /></td>
                <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                  <button onClick={saveNewMember} style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>הוסף</button>
                  <button onClick={() => setIsAdding(false)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>ביטול</button>
                </td>
              </tr>
            )}

            {/* EXISTING MEMBERS ROWS */}
            {members.map(member => (
              <tr key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                {editingId === member.id ? (
                  <>
                    <td style={{ padding: '10px' }}><input name="full_name" value={editForm.full_name || ''} onChange={handleEditChange} style={inputStyle} /></td>
                    <td style={{ padding: '10px' }}><input name="phone" value={editForm.phone || ''} onChange={handleEditChange} style={inputStyle} /></td>
                    <td style={{ padding: '10px' }}><input name="email" value={editForm.email || ''} onChange={handleEditChange} style={inputStyle} /></td>
                    <td style={{ padding: '10px' }}><input name="address" value={editForm.address || ''} onChange={handleEditChange} style={inputStyle} /></td>
                    <td style={{ padding: '10px' }}><input name="birthday" type="date" value={editForm.birthday || ''} onChange={handleEditChange} style={inputStyle} /></td>
                    <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                      <button onClick={saveChanges} style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>שמור</button>
                      <button onClick={() => setEditingId(null)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>ביטול</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{member.full_name}</td>
                    <td style={{ padding: '12px' }}>{member.phone}</td>
                    <td style={{ padding: '12px' }}>{member.email}</td>
                    <td style={{ padding: '12px' }}>{member.address}</td>
                    <td style={{ padding: '12px' }}>{member.birthday}</td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => startEditing(member)} style={{ background: '#002366', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>ערוך</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const inputStyle = { padding: '8px', width: '100%', boxSizing: 'border-box' as const, borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'Heebo, sans-serif' }