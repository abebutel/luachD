'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AdminApprovals() {
  const [pending, setPending] = useState([])

  useEffect(() => {
    fetchPending()
  }, [])

  async function fetchPending() {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('is_approved', false)
    setPending(data || [])
  }

  async function approveMember(id) {
    const { error } = await supabase
      .from('members')
      .update({ is_approved: true })
      .eq('id', id)
    
    if (!error) fetchPending() // Refresh list
  }

  return (
    <div dir="rtl" style={{ padding: '20px', fontFamily: 'Heebo, sans-serif' }}>
      <h1 style={{ color: '#002366' }}>אישור חברים חדשים - לוחD</h1>
      <hr />
      {pending.length === 0 ? (
        <p>אין חברים הממתינים לאישור כרגע.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'right' }}>
              <th style={{ padding: '10px' }}>שם מלא</th>
              <th style={{ padding: '10px' }}>טלפון</th>
              <th style={{ padding: '10px' }}>פעולה</th>
            </tr>
          </thead>
          <tbody>
            {pending.map(member => (
              <tr key={member.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{member.full_name}</td>
                <td style={{ padding: '10px' }}>{member.phone}</td>
                <td style={{ padding: '10px' }}>
                  <button 
                    onClick={() => approveMember(member.id)}
                    style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    אשר חבר
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}