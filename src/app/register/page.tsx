'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase (Ensure these match your .env.local)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Register() {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    birthday: '',
    anniversary: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 1. Insert Member
    const { data, error } = await supabase
      .from('members')
      .insert([
        { 
          full_name: form.full_name, 
          phone: form.phone, 
          address: form.address, 
          birthday: form.birthday || null,
          anniversary: form.anniversary || null,
          synagogue_id: 'c35cdd4c-7f74-4254-b012-16f4677fefa7' // Use the ID from your Synagogues table
        }
      ])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('תודה! הפרטים נשלחו לאישור הגבאי.')
    }
  }

  return (
    <div dir="rtl" style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h1>הצטרפות ללוחD</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input placeholder="שם מלא *" required onChange={e => setForm({...form, full_name: e.target.value})} />
        <input placeholder="טלפון *" required onChange={e => setForm({...form, phone: e.target.value})} />
        <input placeholder="כתובת מגורים *" required onChange={e => setForm({...form, address: e.target.value})} />
        
        <label>תאריך לידה (אופציונלי):</label>
        <input type="date" onChange={e => setForm({...form, birthday: e.target.value})} />
        
        <label>יום נישואין (אופציונלי):</label>
        <input type="date" onChange={e => setForm({...form, anniversary: e.target.value})} />
        
        <button type="submit" style={{ background: '#002366', color: 'white', padding: '10px', borderRadius: '5px' }}>
          שלח לאישור
        </button>
      </form>
    </div>
  )
}