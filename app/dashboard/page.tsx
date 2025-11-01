"use client"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getCookie } from '@/lib/cookies'

export default function DashboardPage() {
  const router = useRouter()
  const [giftcardsCount, setGiftcardsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGiftcardsCount()
  }, [])

  const loadGiftcardsCount = async () => {
    const token = getCookie('token')
    if (!token) {
      router.push('/')
      return
    }

    try {
      const response = await fetch(`/api/giftcards?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGiftcardsCount(data.giftcards?.length || 0)
      }
    } catch (error) {
      console.error('Error cargando giftcards:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center text-white">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl panel-bg border border-yellow-400/40 neon-outline p-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-gray-400">Resumen de tu cuenta</p>
        </div>

        <div className="grid gap-6">
        {/* Estadísticas Card */}
        <div className="rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-yellow-400/30 p-8">
          <h3 className="text-xl font-semibold text-yellow-300 mb-6 flex items-center gap-2">
            <span>📊</span> Estadísticas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg bg-slate-900/60 border border-yellow-400/20 p-6">
              <p className="text-sm text-gray-400 mb-2">Total de Giftcards</p>
              <p className="text-4xl font-bold text-yellow-300">{giftcardsCount}</p>
            </div>
            <div className="rounded-lg bg-slate-900/60 border border-yellow-400/20 p-6">
              <p className="text-sm text-gray-400 mb-2">Estado</p>
              <p className="text-2xl font-bold text-green-400">
                {giftcardsCount > 0 ? 'Activo' : 'Sin giftcards'}
              </p>
            </div>
          </div>
        </div>

        {/* Información Card */}
        <div className="rounded-xl bg-slate-900/60 border border-yellow-400/30 p-6">
          <h3 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center gap-2">
            <span>ℹ️</span> Información
          </h3>
          <div className="space-y-3 text-gray-300">
            <p>En esta sección puedes ver las estadísticas de tu cuenta.</p>
            <p>Para crear y gestionar tus giftcards, ve a la sección <span className="text-yellow-300 font-semibold">Giftcard</span> en el menú lateral.</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
