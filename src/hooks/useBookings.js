import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

async function autoCashEntry(desc, amount) {
  await supabase.from('cash_entries').insert([{
    date: new Date().toISOString().slice(0, 10),
    description: desc,
    amount,
    type: 'income',
    note: 'Auto-recorded from booking payment',
  }])
}

export function useBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: false })
      .order('start_time', { ascending: true })
    if (error) setError(error.message)
    else setBookings(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function addBooking(booking) {
    const { data, error } = await supabase.from('bookings').insert([booking]).select().single()
    if (!error) {
      setBookings(prev => [data, ...prev])
      // Auto cash entry if booking is marked paid on creation
      if (booking.paid) {
        const name = booking.type === 'our' ? booking.tutor_name : booking.booker_name
        await autoCashEntry(`Table rental — ${name} (${booking.table_name})`, booking.amount)
      }
    }
    return { data, error }
  }

  async function updateBooking(id, updates) {
    const { data, error } = await supabase.from('bookings').update(updates).eq('id', id).select().single()
    if (!error) setBookings(prev => prev.map(b => b.id === id ? data : b))
    return { data, error }
  }

  async function cancelBooking(id) {
    return updateBooking(id, { status: 'cancelled', paid: false })
  }

  async function togglePaid(id, current) {
    const booking = bookings.find(b => b.id === id)
    const result = await updateBooking(id, { paid: !current })
    // Auto cash entry when marking as paid (not when unmarking)
    if (!current && booking) {
      const name = booking.type === 'our' ? booking.tutor_name : booking.booker_name
      await autoCashEntry(`Table rental — ${name} (${booking.table_name})`, booking.amount)
    }
    return result
  }

  return { bookings, loading, error, fetch, addBooking, updateBooking, cancelBooking, togglePaid }
}
