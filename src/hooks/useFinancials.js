import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCashEntries() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('cash_entries').select('*').order('date', { ascending: false })
    if (data) setEntries(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function addEntry(entry) {
    const { data, error } = await supabase.from('cash_entries').insert([entry]).select().single()
    if (!error) setEntries(prev => [data, ...prev])
    return { data, error }
  }

  async function deleteEntry(id) {
    const { error } = await supabase.from('cash_entries').delete().eq('id', id)
    if (!error) setEntries(prev => prev.filter(e => e.id !== id))
    return { error }
  }

  const income = entries.filter(e => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0)
  const expenses = entries.filter(e => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0)
  const distributable = Math.max(0, income - expenses)

  return { entries, loading, fetch, addEntry, deleteEntry, income, expenses, distributable }
}

export function useWorkLog() {
  const [worklog, setWorklog] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('work_log').select('*').order('date', { ascending: false })
    if (data) setWorklog(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function addEntry(entry) {
    const { data, error } = await supabase.from('work_log').insert([entry]).select().single()
    if (!error) setWorklog(prev => [data, ...prev])
    return { data, error }
  }

  async function deleteEntry(id) {
    const { error } = await supabase.from('work_log').delete().eq('id', id)
    if (!error) setWorklog(prev => prev.filter(e => e.id !== id))
    return { error }
  }

  const totalHours = worklog.reduce((s, w) => s + Number(w.hours), 0)
  const byPerson = worklog.reduce((acc, w) => {
    acc[w.worker_name] = (acc[w.worker_name] || 0) + Number(w.hours)
    return acc
  }, {})

  return { worklog, loading, fetch, addEntry, deleteEntry, totalHours, byPerson }
}
