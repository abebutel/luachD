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

  // Data States (Updated to include first_name and birthday)
  const [profile, setProfile] = useState({ first_name: '', last_name: '', spouse_name: '', anniversary_date: '', birthday: '' })
  const [members, setMembers] = useState<any[]>([])
  const [azkarot, setAzkarot] = useState<any[]>([])

  // Form States
  const [newChildName, setNewChildName] = useState('')
  const [newChildDate, setNewChildDate] = useState('')
  const [newAzkara, setNewAzkara] = useState({ name: '', hebrew_date: '' })
  const [profileMsg, setProfileMsg] = useState('')

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

  const fetchData = async (userId: string) => {
    setLoading(true)
    const [profRes, memRes, azkRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('members').select('*').eq('user_id', userId).eq('is_child', true),
      supabase.from('azkarot').select('*').eq('user_id', userId)
    ])
    if (profRes.data) setProfile(profRes.data)
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
    setProfile({ first_name: '', last_name: '', spouse_name: '', anniversary_date: '', birthday: '' })
    setMembers([])
    setAzkarot([])
  }

  // --- PROFILE LOGIC ---
  const saveProfile = async () => {
    setProfileMsg('שומר...')
    const upsertData = { 
      user_id: session.user.id, 
      first_name: profile.first_name,
      last_name: profile.last_name, 
      spouse_name: profile.spouse_name, 
      anniversary_date: profile.anniversary_date || null,
      birthday: profile.birthday || null
    }
    await supabase.from('user_profiles').upsert(upsertData)
    setProfileMsg('נשמר בהצלחה!')
    setTimeout(() => setProfileMsg(''), 3000)
  }

  // --- CHILD & AZKARA LOGIC ---
  const handleAddChild = async () => {
    if (!profile.last_name) return alert("יש לשמור שם משפחה קודם")
    if (!newChildName || !newChildDate) return alert("יש למלא שם ותאריך לידה")
    
    const fullName = `${newChildName} ${profile.last_name}`
    const { data, error } = await supabase.from('members').insert([{ 
      full_name: fullName, birthday: newChildDate, is_child: true, user_id: session.user.id, is_approved: true 
    }]).select()

    if (!error && data) {
      setMembers([...members, data[0]])
      setNewChildName('')
      setNewChildDate('')
    }
  }

  const handleDeleteMember = async (id: string) => {
    await supabase.from('members').delete().eq('id', id)
    setMembers(members.filter(m => m.id !== id))
  }

  const handleAddAzkara = async () => {
    if (!newAzkara.name || !newAzkara.hebrew_date) return alert("יש למלא שם ותאריך עברי")
    const { data, error } = await supabase.from('azkarot').insert([{ ...newAzkara, user_id: session.user.id, is_active: true }]).select()
    if (!error && data) {
      setAzkarot([...azkarot, data[0]])
      setNewAzkara({ name: '', hebrew_date: '' })
    }
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
            <button onClick={handleSignIn} style={{ flex: 1, backgroundColor: '#0A2E5C', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>התחבר</button>
            <button onClick={handleSignUp} style={{ flex: 1, backgroundColor: '#7498B5', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>הרשמה</button>
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

      {/* 1. PROFILE SECTION */}
      <section style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#3A6EA5', marginTop: 0, borderBottom: '2px solid #F0F4F8', paddingBottom: '10px' }}>🏠 פרטי המשפחה (קבוע)</h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="שם פרטי שלך" value={profile.first_name || ''} onChange={e => setProfile({...profile, first_name: e.target.value})} style={{...inputStyle, flex: 1}} />
          <input type="text" placeholder="שם משפחה (למשל: כהן)" value={profile.last_name || ''} onChange={e => setProfile({...profile, last_name: e.target.value})} style={{...inputStyle, flex: 1}} />
        </div>
        
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>תאריך יום הולדת שלך:</label>
        <input type="date" value={profile.birthday || ''} onChange={e => setProfile({...profile, birthday: e.target.value})} style={inputStyle} />

        <input type="text" placeholder="שם בן/בת הזוג (אופציונלי)" value={profile.spouse_name || ''} onChange={e => setProfile({...profile, spouse_name: e.target.value})} style={inputStyle} />
        
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>תאריך יום נישואין (לועזי):</label>
        <input type="date" value={profile.anniversary_date || ''} onChange={e => setProfile({...profile, anniversary_date: e.target.value})} style={inputStyle} />
        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '-10px', marginBottom: '15px' }}>* כדי למנוע כפילויות, מספיק שרק אחד מבני הזוג יזין את יום הנישואין.</p>
        
        <button onClick={saveProfile} style={{ width: '100%', backgroundColor: '#0A2E5C', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          שמור פרטים
        </button>
        {profileMsg && <p style={{ textAlign: 'center', color: 'green', marginTop: '10px', fontSize: '0.9rem', fontWeight: 'bold' }}>{profileMsg}</p>}
      </section>

      {/* 2. CHILDREN SECTION */}
      <section style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#3A6EA5', marginTop: 0, borderBottom: '2px solid #F0F4F8', paddingBottom: '10px' }}>🎈 ילדי המשפחה (ימי הולדת)</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
          <input type="text" placeholder="שם פרטי" value={newChildName} onChange={e => setNewChildName(e.target.value)} style={{ ...inputStyle, marginBottom: 0, flex: 2 }} />
          <input type="date" value={newChildDate} onChange={e => setNewChildDate(e.target.value)} style={{ ...inputStyle, marginBottom: 0, flex: 2 }} />
          <button onClick={handleAddChild} style={{ backgroundColor: '#C5A059', color: 'white', padding: '12px 15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>הוסף</button>
        </div>
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
          {members.length === 0 && <p style={{ color: '#888', fontSize: '0.9rem' }}>טרם הוספו ילדים.</p>}
        </ul>
      </section>

      {/* 3. AZKAROT SECTION */}
      <section style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#3A6EA5', marginTop: 0, borderBottom: '2px solid #F0F4F8', paddingBottom: '10px' }}>🕯️ אזכרות</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
          <input type="text" placeholder="שם הנפטר/ת" value={newAzkara.name} onChange={e => setNewAzkara({...newAzkara, name: e.target.value})} style={{ ...inputStyle, marginBottom: 0, flex: 2 }} />
          <input type="text" placeholder="תאריך עברי (למשל: כ״ג אייר)" value={newAzkara.hebrew_date} onChange={e => setNewAzkara({...newAzkara, hebrew_date: e.target.value})} style={{ ...inputStyle, marginBottom: 0, flex: 2 }} />
          <button onClick={handleAddAzkara} style={{ backgroundColor: '#C5A059', color: 'white', padding: '12px 15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>הוסף</button>
        </div>
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