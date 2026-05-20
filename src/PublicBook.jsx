import { useState, useEffect } from 'react'
import { BookTable } from './components/pages/outside/OutsidePages'
import { supabase } from './lib/supabase'

export function PublicBookPage() {
  const [bookings, setBookings] = useState([])
  useEffect(() => {
    supabase.from('bookings').select('*').neq('status','cancelled').then(({data}) => {
      if (data) setBookings(data)
    })
  }, [])
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-500 px-4 py-3">
        <div className="text-white font-semibold text-base flex items-center gap-2">
          บ้านสวน Homie Learning
        </div>
      </div>
      <BookTable bookings={bookings} onBooked={() => {}} />
      <div className="text-center pb-6">
        <button onClick={() => window.location.href = '/'} className="text-sm text-green-500 hover:underline">
          ← Back to sign in
        </button>
      </div>
    </div>
  )
}
