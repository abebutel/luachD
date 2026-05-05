'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function FamilyPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Auth States
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMsg, setAuthMsg] = useState('')
  
  // Registration States
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regAddress, setRegAddress] = useState('')

  // Data States
  const [parentMember, setParentMember] = useState<any>(null)
  const [profile, setProfile] = useState({ spouse_name: '', anniversary_date: '' })
  const [children, setChildren] = useState<any[]>([])
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
      supabase.from('members').select('*').eq('user_id', userId),
      supabase.from('azkarot').select('*').eq('user_id', userId)
    ])
    
    if (profRes.data) setProfile({ spouse_name: profRes.data.spouse_name, anniversary_date: profRes.data.anniversary_date })
    
    if (memRes.data) {
      setParentMember(memRes.data.find(m => !m.is_child))
      setChildren(memRes.data.filter(m => m.is_child))
    }
    if (azkRes.data) setAzkarot(azkRes.data)
    setLoading(false)
  }

  // --- AUTH LOGIC ---
  const handleSignUp = async () => {
    if (!regName || !regPhone || !regAddress) {
      setAuthMsg('שגיאה: יש למלא שם מלא, טלפון וכתובת.')
      return
    }
    
    setAuthMsg('יוצר חשבון...')
    const { data: authData, error } = await supabase.auth.signUp({ email, password })
    
    if (error) {
      setAuthMsg(`שגיאה: ${error.message}`)
    } else if (authData.user) {
      // 1. Create Parent in Members Table (So they appear in Admin Directory)
      await supabase.from('members').insert({
        user_id: authData.user.id,
        full_name: regName,
        phone: regPhone,
        address: regAddress,
        is_child: false,
        is_approved: true // Auto-approved for Pilot
      })
      
      // 2. Initialize Profile
      await supabase.from('user_profiles').insert({
        user_id: authData.user.id,
        last_name: regName.split(' ').pop() || '',
        first_name: regName.split(' ')[0] || ''
      })
      
      setAuthMsg('חשבון נוצר בהצלחה! מתחבר...')
    }
  }

  const handleSignIn = async () => {
    setAuthMsg('מתחבר...')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthMsg('שגיאה בפרטי ההתחברות.')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setParentMember(null)
    setProfile({ spouse_name: '', anniversary_date: '' })
    setChildren([])
    setAzkarot([])
  }

  // --- PROFILE LOGIC ---
  const saveProfile = async () => {
    setProfileMsg('שומר...')
    
    // Update Parent's Birthday in Members table
    if (parentMember) {
      await supabase.from('members').update({ birthday: parentMember.birthday }).eq('id', parentMember.id)
    }

    // Update Anniversary in Profiles table
    await supabase.from('user_profiles').update({ 
      spouse_name: profile.spouse_name, 
      anniversary_date: profile.anniversary_date || null 
    }).eq('user_id', session.user.id)
    
    setProfileMsg('נשמר בהצלחה!')
    setTimeout(() => setProfileMsg(''), 3000)
  }

  // --- CHILD & AZKARA LOGIC ---
  const handleAddChild = async () => {
    if (!newChildName || !newChildDate) return alert("יש למלא שם ותאריך לידה")
    
    // Append parent's last name automatically
    const lastName = parentMember?.full_name?.split(' ').pop() || ''
    const fullName = `${newChildName} ${lastName}`
    
    const { data, error } = await supabase.from('members').insert([{ 
      full_name: fullName, birthday: newChildDate, is_child: true, user_id: session.user.id, is_approved: true 
    }]).select()

    if (!error && data) {
      setChildren([...children, data[0]])
      setNewChildName('')
      setNewChildDate('')
    }
  }

  const handleDeleteMember = async (id: string) => {
    await supabase.from('members').delete().eq('id', id)
    setChildren(children.filter(m => m.id !== id))
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

  // === RENDER LOGIN / REGISTER SCREEN ===
  if (!session) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Heebo, sans-serif' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', marginTop: '40px' }}>
          <h1 style={{ color: '#0A2E5C', marginBottom: '10px' }}>{isLoginMode ? 'התחברות למערכת' : 'הרשמה לקהילה'}</h1>
          
          <input type="email" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="סיסמה (לפחות 6 תווים)" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          
          {!isLoginMode && (
            <>
              <input type="text" placeholder="שם מלא (משפחה ופרטי)" value={regName} onChange={(e) => setRegName(e.target.value)} style={inputStyle} />
              <input type="tel" placeholder="מספר טלפון" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} style={inputStyle} />
              <input type="text" placeholder="כתובת מלאה" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} style={inputStyle} />
            </>
          )}

          {isLoginMode ? (
            <button onClick={handleSignIn} style={{ width: '100%', backgroundColor: '#0A2E5C', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>התחבר</button>
          ) : (
            <button onClick={handleSignUp} style={{ width: '100%', backgroundColor: '#7498B5', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>צור חשבון</button>
          )}
          
          <p onClick={() => setIsLoginMode(!isLoginMode)} style={{ marginTop: '20px', color: '#3A6EA5', cursor: 'pointer', textDecoration: 'underline' }}>
            {isLoginMode ? 'אין לך חשבון? לחץ כאן להרשמה' : 'כבר רשום? לחץ כאן להתחברות'}
          </p>

          {authMsg && <p style={{ marginTop: '15px', color: authMsg.includes('שגיאה') ? 'red' : 'green', fontWeight: 'bold' }}>{authMsg}</p>}
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
        
        {parentMember && (
          <>
            <p style={{ color: '#0A2E5C', fontWeight: 'bold', margin: '0 0 10px 0' }}>רשום ע"ש: {parentMember.full_name}</p>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>תאריך יום הולדת שלך:</label>
            <input type="date" value={parentMember.birthday || ''} onChange={e => setParentMember({...parentMember, birthday: e.target.value})} style={inputStyle} />
          </>
        )}

        <input type="text" placeholder="שם בן/בת הזוג (אופציונלי)" value={profile.spouse_name || ''} onChange={e => setProfile({...profile, spouse_name: e.target.value})} style={inputStyle} />
        
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>תאריך יום נישואין (לועזי):</label>
        <input type="date" value={profile.anniversary_date || ''} onChange={e => setProfile({...profile, anniversary_date: e.target.value})} style={inputStyle} />
        
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
          {children.map(c => (
            <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ fontSize: '1.1rem', color: '#0A2E5C', fontWeight: 'bold' }}>{c.full_name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: '#555' }}>{c.birthday}</span>
                <button onClick={() => handleDeleteMember(c.id)} style={deleteBtnStyle}>מחק</button>
              </div>
            </li>
          ))}
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
        </ul>
      </section>

    </div>
  )
}

const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #A0B2C6', boxSizing: 'border-box' as const, fontFamily: 'Heebo, sans-serif' }
const deleteBtnStyle = { backgroundColor: '#ffe3e6', color: '#dc3545', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }