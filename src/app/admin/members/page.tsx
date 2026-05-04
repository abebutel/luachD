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

  // Fetch all approved members
  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    setLoading(true)
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('is_approved', true)
      .order('full_name', { ascending: true }) // Sort alphabetically
    
    if (data) setMembers(data)
    setLoading(false)
  }

  // Start editing a specific row
  const startEditing = (member: any) => {
    setEditingId(member.id)
    setEditForm(member)
  }

  // Handle typing in the edit inputs
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  // Save changes to Supabase
  const saveChanges = async () => {
    const { error } = await supabase
      .from('members')
      .update({
        full_name: editForm.full_name,
        phone: editForm.phone,
        email: editForm.email,
        address: editForm.address,
        birthday: editForm.birthday
      })
      .eq('id', editingId)

    if (!error) {
      // Update local state so we don't have to refresh the page
      setMembers(members.map(m => m.id === editingId ? editForm : m))
      setEditingId(null) // Close edit mode
    } else {
      alert("שגיאה בשמירת הנתונים")
    }
  }

  if (loading) return <p>טוען נתוני חברים...</p>

  return (
    <div dir="rtl">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '20px' }}>
        <h1 style={{ color: '#002366', margin: 0 }}>ספר קהילה</h1>
        <div style={{ fontSize: '1.2rem', color: '#8892b0' }}>
          סה"כ רשומים: <strong style={{ color: '#b38728' }}>{members.length}</strong>
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
              <th style={{ padding: '12px' }}>תאריך לידה</th>
              <th style={{ padding: '12px' }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id} style={{ borderBottom: '1px solid #eee', transition: 'background-color 0.2s' }}>
                
                {/* If this row is being edited, show INPUTS */}
                {editingId === member.id ? (
                  <>
                    <td style={{ padding: '10px' }}><input name="full_name" value={editForm.full_name || ''} onChange={handleFormChange} style={inputStyle} /></td>
                    <td style={{ padding: '10px' }}><input name="phone" value={editForm.phone || ''} onChange={handleFormChange} style={inputStyle} /></td>
                    <td style={{ padding: '10px' }}><input name="email" value={editForm.email || ''} onChange={handleFormChange} style={inputStyle} /></td>
                    <td style={{ padding: '10px' }}><input name="address" value={editForm.address || ''} onChange={handleFormChange} style={inputStyle} /></td>
                    <td style={{ padding: '10px' }}><input name="birthday" type="date" value={editForm.birthday || ''} onChange={handleFormChange} style={inputStyle} /></td>
                    <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                      <button onClick={saveChanges} style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>שמור</button>
                      <button onClick={() => setEditingId(null)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>ביטול</button>
                    </td>
                  </>
                ) : (
                  /* If NOT being edited, show standard TEXT */
                  <>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{member.full_name}</td>
                    <td style={{ padding: '12px' }}>{member.phone}</td>
                    <td style={{ padding: '12px' }}>{member.email}</td>
                    <td style={{ padding: '12px' }}>{member.address}</td>
                    <td style={{ padding: '12px' }}>{member.birthday}</td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => startEditing(member)} 
                        style={{ background: '#002366', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
                      >
                        ערוך מנוי
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            
            {members.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                  אין חברים מאושרים במערכת.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Reusable styling for the edit inputs
const inputStyle = {
  padding: '8px',
  width: '100%',
  boxSizing: 'border-box' as const,
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontFamily: 'Heebo, sans-serif'
}