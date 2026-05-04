'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // If not logged in, redirect to login page (unless they are already there)
  useEffect(() => {
    if (!loading && !session && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [session, loading, pathname, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.5rem', fontFamily: 'Heebo' }}>טוען מערכת...</div>
  }

  // If on the login page, just show the login page without the sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Master Dashboard Layout
  return (
    <div dir="rtl" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Heebo, sans-serif', backgroundColor: '#f4f7f6' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: '250px', backgroundColor: '#002366', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: '#b38728', borderBottom: '1px solid #233554', paddingBottom: '15px', marginBottom: '20px' }}>
          לוחD - ניהול
        </h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <Link href="/admin/approvals" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px', backgroundColor: pathname === '/admin/approvals' ? '#113a85' : 'transparent' }}>
            ✓ אישורי חברים
          </Link>
          <Link href="/admin/members" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px', backgroundColor: pathname === '/admin/members' ? '#113a85' : 'transparent' }}>
            👥 ספר קהילה (Directory)
          </Link>
          <Link href="/admin/prayers" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px', backgroundColor: pathname === '/admin/prayers' ? '#113a85' : 'transparent' }}>
            🕰️ זמני תפילה
          </Link>
          <Link href="/admin/settings" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px', backgroundColor: pathname === '/admin/settings' ? '#113a85' : 'transparent' }}>
            ☀️ זמני היום (הלכה)
          </Link>
          <Link href="/admin/announcements" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px', backgroundColor: pathname === '/admin/announcements' ? '#113a85' : 'transparent' }}>
            📢 הודעות קהילה
          </Link>
          <Link href="/admin/shabbat" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '5px', backgroundColor: pathname === '/admin/shabbat' ? '#113a85' : 'transparent' }}>
            🍷 שבת הקרובה
          </Link>
        </nav>

        <button onClick={handleLogout} style={{ marginTop: 'auto', padding: '10px', backgroundColor: '#b38728', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}>
          התנתק
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          {children}
        </div>
      </main>

    </div>
  )
}