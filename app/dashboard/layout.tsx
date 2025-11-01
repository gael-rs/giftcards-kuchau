"use client"
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getCookie, deleteCookie } from '@/lib/cookies'

interface User {
  id: string
  username: string
  role: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = getCookie('token')

    if (!storedToken) {
      router.push('/')
      return
    }

    fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: storedToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid && data.user) {
          setUser(data.user)
        } else {
          deleteCookie('token')
          router.push('/')
        }
      })
      .catch(() => {
        deleteCookie('token')
        router.push('/')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [router])

  const handleLogout = () => {
    deleteCookie('token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1115] flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isDashboardActive = pathname === '/dashboard'
  const isGiftcardActive = pathname?.startsWith('/dashboard/giftcards')

  const getHeaderTitle = () => {
    if (isGiftcardActive && pathname !== '/dashboard') {
      return 'Giftcard'
    }
    return 'Dashboard'
  }

  return (
    <div className="relative min-h-screen bg-[#0e1115]">
      <div className="ambient-grid" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-yellow-400/20 bg-slate-900/95 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">{getHeaderTitle()}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Usuario: <span className="text-yellow-300 font-semibold">{user.username}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-72 flex-shrink-0">
            <div className="sticky top-[73px] space-y-4">
              <nav className="rounded-2xl panel-bg border border-yellow-400/40 neon-outline p-4">
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    className={`block w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isDashboardActive
                        ? 'bg-yellow-400/20 border-2 border-yellow-400/60 text-yellow-300 shadow-lg shadow-yellow-400/20'
                        : 'bg-slate-800/60 border border-yellow-400/20 text-gray-300 hover:bg-slate-800/80 hover:text-yellow-300 hover:border-yellow-400/40'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/giftcards"
                    className={`block w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isGiftcardActive
                        ? 'bg-yellow-400/20 border-2 border-yellow-400/60 text-yellow-300 shadow-lg shadow-yellow-400/20'
                        : 'bg-slate-800/60 border border-yellow-400/20 text-gray-300 hover:bg-slate-800/80 hover:text-yellow-300 hover:border-yellow-400/40'
                    }`}
                  >
                    Giftcard
                  </Link>
                </div>
              </nav>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-600/30"
              >
                Cerrar sesión
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

