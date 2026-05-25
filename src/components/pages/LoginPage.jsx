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

        {/* Logo */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="บ้านสวน Homie Learning" className="w-32 h-32 mx-auto mb-3 object-contain" />
          <h1 className="text-xl font-semibold text-gray-800">บ้านสวน Homie Learning</h1>
          <p className="text-sm text-gray-400 mt-1">ระบบจัดการ · Management System</p>
        </div>

        {/* Book a table - BIG prominent button */}
        <a href="/book"
          className="flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 rounded-2xl transition-colors text-base shadow-lg mb-2">
          <i className="ti ti-calendar-plus text-xl" aria-hidden="true" />
          จองโต๊ะเรียน · Book a Table
        </a>
        <p className="text-center text-xs text-gray-400 mb-6">ไม่ต้องสมัครสมาชิก · No sign-in required</p>

        {/* Contact info */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <a href="https://www.facebook.com/profile.php?id=61590004118012"
            target="_blank" rel="noreferrer"
            className="flex flex-col items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl py-3 px-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-xs font-medium">Facebook</span>
          </a>

          <a href="https://line.me/R/ti/p/@rumgc"
            target="_blank" rel="noreferrer"
            className="flex flex-col items-center gap-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl py-3 px-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            <span className="text-xs font-medium">LINE OA</span>
          </a>

          <a href="tel:0902107160"
            className="flex flex-col items-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl py-3 px-2 transition-colors">
            <i className="ti ti-phone text-2xl" aria-hidden="true" />
            <span className="text-xs font-medium">โทร</span>
          </a>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-100"></div>
          <span className="text-xs text-gray-300">เจ้าหน้าที่ · Staff login</span>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email" required
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200" />
          </div>
          <div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" required
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200" />
          </div>
          {error && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm">
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ · Sign in'}
          </button>
        </form>

      </div>

      <p className="text-xs text-gray-400 mt-4">บ้านสวน Homie Learning · Tanyongmat, Narathiwat</p>
    </div>
  )
}
