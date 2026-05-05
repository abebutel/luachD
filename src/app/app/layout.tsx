'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { name: 'לוח הקיר', path: '/app', icon: '🕍' },
    { name: 'המשפחה שלי', path: '/app/family', icon: '👨‍👩‍👧‍👦' },
    { name: 'תרומות', path: '/app/donate', icon: '💳' },
  ]

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F0F4F8', fontFamily: 'Heebo, sans-serif' }}>
      
      {/* Main Content Area (Scrollable) */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
        {children}
      </main>

      {/* Fixed Bottom Mobile Navigation */}
      <nav style={{ 
        position: 'fixed', bottom: 0, width: '100%', height: '70px', 
        backgroundColor: '#FFFFFF', borderTop: '1px solid #E0E6ED', 
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', zIndex: 1000
      }}>
        {navItems.map(item => {
          const isActive = pathname === item.path
          return (
            <Link key={item.path} href={item.path} style={{ textDecoration: 'none', color: isActive ? '#0A2E5C' : '#8892b0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1 }}>
              <span style={{ fontSize: '1.8rem', filter: isActive ? 'none' : 'grayscale(100%) opacity(0.5)' }}>{item.icon}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 'bold' : 'normal' }}>{item.name}</span>
            </Link>
          )
        })}
      </nav>

    </div>
  )
}