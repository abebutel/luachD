'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BulkImporter() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage('מעבד קובץ...')

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)

        // Map Excel columns to Database columns
        const formattedData = data.map((row: any) => ({
          full_name: row['Full Name'],
          phone: row['Phone'],
          birthday: row['Birthday (YYYY-MM-DD)'],
          address: row['Address'],
          email: row['Email'],
          is_approved: true, // Auto-approve bulk imports
          synagogue_id: 1 // Default to Modiin for now
        }))

        const { error } = await supabase.from('members').insert(formattedData)

        if (error) throw error
        setMessage(`הצלחה! הוספו ${formattedData.length} חברים למערכת.`)
      } catch (err: any) {
        setMessage(`שגיאה: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    reader.readAsBinaryString(file)
  }

  return (
    <div dir="rtl" style={{ padding: '50px', maxWidth: '600px', margin: 'auto', fontFamily: 'Heebo, sans-serif' }}>
      <h1 style={{ color: '#002366' }}>ייבוא חברים מקובץ Excel</h1>
      <p>העלה את הקובץ LuachD_Member_Import_Template כדי להוסיף חברים בכמות גדולה.</p>
      
      <div style={{ marginTop: '30px', border: '2px dashed #ccc', padding: '40px', textAlign: 'center' }}>
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileUpload} 
          disabled={loading}
        />
      </div>

      {message && (
        <p style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '5px' }}>
          {message}
        </p>
      )}
    </div>
  )
}