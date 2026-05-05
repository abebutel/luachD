'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function FamilyPage() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [authMsg, setAuthMsg] = useState('')

  // Data States
  const [members, setMembers] = useState<any[]>([])
  const [azkarot, setAzkarot] = useState<any[]>([])

  // Form States
  const [newMember, setNewMember] = useState({ full_name: '', birthday: '' })
  const [newAzkara, setNewAzkara] = useState({ name: '', hebrew_date: '' })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchData(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchData(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  // --- DATA FETCHING ---
  const fetchData = async (userId: string) => {
    setLoading(true)
    const [memRes, azkRes] = await Promise.all([
      supabase.from('members').select('*').eq('user_id', userId),
      supabase.from('azkarot').select('*').eq('user_id', userId)
    ])
    if (memRes.data) setMembers(memRes.data)
    if (azkRes.data) setAzkarot(azkRes.data)
    setLoading(false)
  }

  // --- AUTH LOGIC ---
  const handleSignUp = async () => {
    setAuthMsg('יוצר חשבון...')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setAuthMsg(`שגיאה: ${error.message}`)
    else setAuthMsg('חשבון נוצר בהצלחה! התחבר כעת.')
  }

  const handleSignIn = async () => {
    setAuthMsg('מתחבר...')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthMsg('שגיאה בפרטי ההתחברות.')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMembers([])
    setAzkarot([])
  }

  // --- ADD / DELETE LOGIC ---
  const handleAddMember = async () => {
    if (!newMember.full_name || !newMember.birthday) return alert("יש למלא שם ותאריך לידה")
    
    const { data, error } = await supabase.from('members').insert([{ 
      ...newMember, 
      user_id: session.user.id,
      is_approved: true // Auto-approve for pilot, Gabbai can change later
    }]).select()

    if (!error && data) {
      setMembers([...members, data[0]])
      setNewMember({ full_name: '', birthday: '' })
    } else alert("שגיאה בהוספת בן משפחה")
  }

  const handleDeleteMember = async (id: string) => {
    await supabase.from('members').delete().eq('id', id)
    setMembers(members.filter(m => m.id !== id))
  }

  const handleAddAzkara = async () => {
    if (!newAzkara.name || !newAzkara.hebrew_date) return alert("יש למלא שם ותאריך עברי")
    
    const { data, error } = await supabase.from('azkarot').insert([{ 
      ...newAzkara, 
      user_id: session.user.id,
      is_active: true
    }]).select()

    if (!error && data) {
      setAzkarot([...azkarot, data[0]])
      setNewAzkara({ name: '', hebrew_date: '' })
    } else alert("שגיאה בהוספת אזכרה")
  }

  const handleDeleteAzkara = async (id: string) => {
    await supabase.from('azkarot').delete().eq('id', id)
    setAzkarot(azkarot.filter(a => a.id !== id))
  }


  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', color: '#0A2E5C' }}>טוען נתונים...</div>

  // === RENDER LOGIN SCREEN ===
  if (!session) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Heebo, sans-serif' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', marginTop: '40px' }}>
          <h1 style={{ color: '#0A2E5C', marginBottom: '10px' }}>התחברות לאזור האישי</h1>
          <p style={{ color: '#555', marginBottom: '25px', fontSize: '0.9rem' }}>כדי לנהל את האזכרות והימי הולדת של המשפחה, אנא התחבר או הרשם למערכת.</p>
          
          <input type="email" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="סיסמה (לפחות 6 תווים)" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSignIn} style={{ flex: 1, backgroundColor: '#0A2E5C', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>התחבר</button>
            <button onClick={handleSignUp} style={{ flex: 1, backgroundColor: '#7498B5', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>הרשמה</button>
          </div>
          
          {authMsg && <p style={{ marginTop: '20px', color: authMsg.includes('שגיאה') ? 'red' : 'green', fontWeight: 'bold' }}>{authMsg}</p>}
        </div>
      </div>
    )
  }

  // === RENDER DASHBOARD ===
  return (
    <div style={{ padding: '20px', paddingBottom: '90px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Heebo, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#FFFFFF', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h1 style={{ color: '#0A2E5C', margin: 0, fontSize: '1.6rem' }}>המשפחה שלי</h1>
        <button onClick={handleSignOut} style={{ backgroundColor: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '5px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>התנתק</button>
      </header>

      {/* BIRTHDAYS SECTION */}
      <section style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#3A6EA5', marginTop: 0, borderBottom: '2px solid #F0F4F8', paddingBottom: '10px' }}>🎉 ימי הולדת וימי נישואין</h2>
        
        {/* Add Form */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
          <input type="text" placeholder="שם החוגג/ת" value={newMember.full_name} onChange={e => setNewMember({...newMember, full_name: e.target.value})} style={{ ...inputStyle, marginBottom: 0, flex: 2 }} />
          <input type="date" value={newMember.birthday} onChange={e => setNewMember({...newMember, birthday: e.target.value})} style={{ ...inputStyle, marginBottom: 0, flex: 2 }} />
          <button onClick={handleAddMember} style={{ backgroundColor: '#C5A059', color: 'white', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>הוסף</button>
        </div>

        {/* List */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {members.map(m => (
            <li key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ fontSize: '1.1rem', color: '#0A2E5C', fontWeight: 'bold' }}>{m.full_name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: '#555' }}>{m.birthday}</span>
                <button onClick={() => handleDeleteMember(m.id)} style={deleteBtnStyle}>מחק</button>
              </div>
            </li>
          ))}
          {members.length === 0 && <p style={{ color: '#888', fontSize: '0.9rem' }}>טרם הוספו ימי הולדת.</p>}
        </ul>
      </section>

      {/* AZKAROT SECTION */}
      <section style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#3A6EA5', marginTop: 0, borderBottom: '2px solid #F0F4F8', paddingBottom: '10px' }}>🕯️ אזכרות</h2>
        
        {/* Add Form */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
          <input type="text" placeholder="שם הנפטר/ת" value={newAzkara.name} onChange={e => setNewAzkara({...newAzkara, name: e.target.value})} style={{ ...inputStyle, marginBottom: 0, flex: 2 }} />
          <input type="text" placeholder="תאריך עברי (למשל: כ״ג אייר)" value={newAzkara.hebrew_date} onChange={e => setNewAzkara({...newAzkara, hebrew_date: e.target.value})} style={{ ...inputStyle, marginBottom: 0, flex: 2 }} />
          <button onClick={handleAddAzkara} style={{ backgroundColor: '#C5A059', color: 'white', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>הוסף</button>
        </div>

        {/* List */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {azkarot.map(a => (
            <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ fontSize: '1.1rem', color: '#0A2E5C', fontWeight: 'bold' }}>{a.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: '#555' }}>{a.hebrew_date}</span>
                <button onClick={() => handleDeleteAzkara(a.id)} style={deleteBtnStyle}>מחק</button>
              </div>
            </li>
          ))}
          {azkarot.length === 0 && <p style={{ color: '#888', fontSize: '0.9rem' }}>טרם הוספו אזכרות.</p>}
        </ul>
      </section>

    </div>
  )
}

const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #A0B2C6', boxSizing: 'border-box' as const, fontFamily: 'Heebo, sans-serif' }
const deleteBtnStyle = { backgroundColor: '#ffe3e6', color: '#dc3545', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }