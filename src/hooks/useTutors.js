import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTutors() {
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tutors')
      .select('*')
      .eq('active', true)
      .order('name')
    if (data) setTutors(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function addTutor(tutor) {
    const { data, error } = await supabase.from('tutors').insert([tutor]).select().single()
    if (!error) setTutors(prev => [...prev, data].sort((a,b) => a.name.localeCompare(b.name)))
    return { data, error }
  }

  async function deactivateTutor(id) {
    const { error } = await supabase.from('tutors').update({ active: false }).eq('id', id)
    if (!error) setTutors(prev => prev.filter(t => t.id !== id))
    return { error }
  }

  const tutorNames = tutors.map(t => t.name)

  return { tutors, loading, fetch, addTutor, deactivateTutor, tutorNames }
}
