export const metadata = {
  title: 'לוחD',
  description: 'מערכת ניהול חכמה לבתי כנסת',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ margin: 0, padding: 0, boxSizing: 'border-box' }}>
        {children}
      </body>
    </html>
  )
}