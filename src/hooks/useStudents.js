import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ── Students ──────────────────────────────────────────────────────────────────
export function useStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('students').select('*').order('join_date', { ascending: false })
    if (data) setStudents(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function addStudent(student) {
    const { data, error } = await supabase.from('students').insert([student]).select().single()
    if (!error) setStudents(prev => [data, ...prev])
    return { data, error }
  }

  async function updateStudent(id, updates) {
    const { data, error } = await supabase.from('students').update(updates).eq('id', id).select().single()
    if (!error) setStudents(prev => prev.map(s => s.id === id ? data : s))
    return { data, error }
  }

  return { students, loading, fetch, addStudent, updateStudent }
}

// ── Enrollments ───────────────────────────────────────────────────────────────
export function useEnrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('enrollments')
      .select('*, students(name, level)')
      .order('created_at', { ascending: false })
    if (data) setEnrollments(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function addEnrollment(enrollment) {
    const { data, error } = await supabase.from('enrollments').insert([enrollment]).select('*, students(name, level)').single()
    if (!error) setEnrollments(prev => [data, ...prev])
    return { data, error }
  }

  async function updateEnrollment(id, updates) {
    const { data, error } = await supabase.from('enrollments').update(updates).eq('id', id).select('*, students(name, level)').single()
    if (!error) setEnrollments(prev => prev.map(e => e.id === id ? data : e))
    return { data, error }
  }

  async function recordPayment(id, { amount, payDate, payMethod, evidenceFile }) {
    let evidence_url = null

    // Upload evidence image if provided
    if (evidenceFile) {
      const ext = evidenceFile.name.split('.').pop()
      const path = `evidence/${id}-${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(path, evidenceFile, { upsert: true })
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('evidence').getPublicUrl(path)
        evidence_url = publicUrl
      }
    }

    return updateEnrollment(id, {
      paid: true,
      amount,
      pay_date: payDate,
      pay_method: payMethod,
      evidence_url,
    })
  }

  async function markUnpaid(id) {
    return updateEnrollment(id, { paid: false, pay_date: null, pay_method: null, evidence_url: null })
  }

  return { enrollments, loading, fetch, addEnrollment, updateEnrollment, recordPayment, markUnpaid }
}
