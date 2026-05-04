'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function GabbaiLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('שגיאה בהתחברות: אימייל או סיסמה שגויים.')
    } else {
      // Success! Send the Gabbai to the approvals page
      router.push('/admin/approvals')
    }
  }

  return (
    <div dir="rtl" style={{ padding: '50px', maxWidth: '400px', margin: 'auto', fontFamily: 'Heebo, sans-serif' }}>
      <h1 style={{ color: '#002366', textAlign: 'center' }}>כניסת גבאי - לוחD</h1>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
        <input 
          type="email" 
          placeholder="אימייל" 
          required 
          onChange={e => setEmail(e.target.value)}
          style={{ padding: '10px', fontSize: '1.1rem', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input 
          type="password" 
          placeholder="סיסמה" 
          required 
          onChange={e => setPassword(e.target.value)}
          style={{ padding: '10px', fontSize: '1.1rem', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        
        <button type="submit" style={{ background: '#b38728', color: 'white', padding: '12px', borderRadius: '5px', fontSize: '1.2rem', cursor: 'pointer', border: 'none' }}>
          התחבר
        </button>
      </form>
    </div>
  )
}