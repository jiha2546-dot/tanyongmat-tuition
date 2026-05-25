import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 flex flex-col items-center justify-center p-4">

      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">

        <div className="text-center mb-6">
          <img src="/logo.png" alt="บ้านสวน Homie Learning" className="w-32 h-32 mx-auto mb-3 object-contain" />
          <h1 className="text-xl font-semibold text-gray-800">บ้านสวน Homie Learning</h1>
          <p className="text-sm text-gray-400 mt-1">ระบบจัดการ · Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200" />
          </div>
          {error && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm">
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ · Sign in'}
          </button>
        </form>

        <div className="border-t border-gray-100 pt-5">
          <p className="text-center text-sm text-gray-500 mb-3">ผู้ปกครอง / ครูภายนอก?</p>
          <a href="/book"
            className="flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-md">
            <i className="ti ti-calendar-plus text-lg" aria-hidden="true" />
            จองโต๊ะเรียน · Book a table
          </a>
          <p className="text-center text-xs text-gray-300 mt-2">ไม่ต้องสมัครสมาชิก · No sign-in required</p>
        </div>

      </div>
    </div>
  )
}
