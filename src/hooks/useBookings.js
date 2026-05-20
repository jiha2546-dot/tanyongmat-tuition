import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

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
    if (!error) setBookings(prev => [data, ...prev])
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
    return updateBooking(id, { paid: !current })
  }

  return { bookings, loading, error, fetch, addBooking, updateBooking, cancelBooking, togglePaid }
}
