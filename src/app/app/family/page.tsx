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

  // Placeholder state for the family data we will build out next
  const [familyMembers, setFamilyMembers] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

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
    setFamilyMembers([])
  }

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>טוען...</div>

  // === RENDER LOGIN SCREEN (If not logged in) ===
  if (!session) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Heebo, sans-serif' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', marginTop: '40px' }}>
          <h1 style={{ color: '#0A2E5C', marginBottom: '10px' }}>התחברות לאזור האישי</h1>
          <p style={{ color: '#555', marginBottom: '25px', fontSize: '0.9rem' }}>כדי לנהל את האזכרות והימי הולדת של המשפחה, אנא התחבר או הרשם למערכת.</p>
          
          <input 
            type="email" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          <input 
            type="password" placeholder="סיסמה (לפחות 6 תווים)" value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSignIn} style={{ flex: 1, backgroundColor: '#0A2E5C', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>התחבר</button>
            <button onClick={handleSignUp} style={{ flex: 1, backgroundColor: '#7498B5', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>הרשמה</button>
          </div>
          
          {authMsg && <p style={{ marginTop: '20px', color: authMsg.includes('שגיאה') ? 'red' : 'green', fontWeight: 'bold' }}>{authMsg}</p>}
        </div>
      </div>
    )
  }

  // === RENDER "MY FAMILY" DASHBOARD (If logged in) ===
  return (
    <div style={{ padding: '20px', paddingBottom: '90px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Heebo, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ color: '#0A2E5C', margin: 0 }}>המשפחה שלי</h1>
        <button onClick={handleSignOut} style={{ backgroundColor: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '5px 15px', borderRadius: '20px', cursor: 'pointer' }}>התנתק</button>
      </header>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👨‍👩‍👧‍👦</div>
        <h2 style={{ color: '#3A6EA5', marginTop: 0 }}>ברוכים הבאים!</h2>
        <p style={{ color: '#555' }}>מחובר כ: <strong>{session.user.email}</strong></p>
        
        <p style={{ marginTop: '20px', color: '#888' }}>
          *בחלק הבא נבנה את הטפסים המאפשרים הוספת בני משפחה, תאריכי ימי הולדת ואזכרות ישירות למסד הנתונים.*
        </p>
      </div>

    </div>
  )
}