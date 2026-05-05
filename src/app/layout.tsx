export const metadata = {
  title: 'לוח D',
  description: 'Synagogue Smart Board',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#06142E' }}>
        {children}
      </body>
    </html>
  )
}