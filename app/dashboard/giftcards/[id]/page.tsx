"use client"
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Giftcard from '@/components/Giftcard'
import { getCookie } from '@/lib/cookies'

export default function GiftcardPage() {
  const router = useRouter()
  const params = useParams()
  const giftcardNumber = parseInt(params.id as string)
  const [giftcard, setGiftcard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadGiftcard()
  }, [giftcardNumber])

  const loadGiftcard = async () => {
    const token = getCookie('token')
    if (!token) {
      router.push('/')
      return
    }

    if (isNaN(giftcardNumber)) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/giftcards/${giftcardNumber}?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGiftcard(data.giftcard)
      } else {
        const data = await response.json()
        if (response.status === 404) {
          // Giftcard no encontrada
        }
      }
    } catch (error) {
      console.error('Error cargando giftcard:', error)
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

  if (!giftcard) {
    return (
      <div className="rounded-2xl panel-bg border border-yellow-400/40 neon-outline p-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-red-400 mb-2">Giftcard no encontrada</h2>
            <p className="text-gray-400">La giftcard solicitada no existe</p>
          </div>
          <div className="rounded-xl bg-red-900/20 border border-red-400/40 p-8">
            <p className="text-red-300 mb-6">No se pudo encontrar la giftcard #{giftcardNumber}.</p>
            <button
              onClick={() => router.push('/dashboard/giftcards')}
              className="px-6 py-3 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition-colors"
            >
              ← Volver a Giftcards
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Giftcard 123 tiene la flag (solo si es del usuario y existe)
  const hasFlag = giftcard.number === 123 && giftcard.code.includes('FLAG')

  const handleDownloadImage = async () => {
    setDownloading(true)
    try {
      // Para la giftcard 123, descargar testing.png
      // Para todas las demás, descargar giftcard-all.jpg
      const imagePath = giftcard.number === 123 
        ? '/giftcards/testing.png'
        : '/giftcards/giftcard-all.jpg'
      
      const filename = giftcard.number === 123
        ? `giftcard-${giftcard.number}-testing.png`
        : `giftcard-${giftcard.number}-all.jpg`

      // Descargar la imagen directamente desde public
      const response = await fetch(imagePath)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error descargando imagen:', error)
      alert('Error al descargar la imagen')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="rounded-2xl panel-bg border border-yellow-400/40 neon-outline p-8">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Giftcard #{giftcard.number}</h2>
            <p className="text-gray-400">Tu giftcard única</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/giftcards')}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
          >
            ← Volver
          </button>
        </div>

        <div className="grid gap-6">
        {/* Giftcard Visual Card */}
        <div className="rounded-xl bg-slate-900/60 border border-yellow-400/30 p-8 flex flex-col items-center">
          <div className="w-full max-w-md">
            <Giftcard code={giftcard.code} id={giftcard.number} imageUrl={giftcard.imageUrl} size="large" />
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(giftcard.code)
                alert('Código copiado al portapapeles')
              }}
              className="flex-1 px-4 py-3 rounded-lg bg-yellow-400/20 border border-yellow-400/40 hover:bg-yellow-400/30 text-yellow-300 font-semibold transition-colors"
            >
              📋 Copiar Código
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="flex-1 px-4 py-3 rounded-lg bg-green-500/20 border border-green-400/40 hover:bg-green-500/30 text-green-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? '⏳ Descargando...' : '📥 Descargar Imagen'}
            </button>
          </div>
        </div>

        {/* Special Message Card */}
        {hasFlag && (
          <div className="rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-2 border-green-400/60 p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🎉</span>
              <div>
                <h3 className="text-2xl font-bold text-green-300">¡Felicidades!</h3>
                <p className="text-green-200">Has encontrado la giftcard especial</p>
              </div>
            </div>
            <div className="bg-green-900/20 p-4 rounded-lg border border-green-400/40">
              <p className="text-green-300 font-semibold">
                Esta giftcard contiene la flag del CTF. ¡Buena búsqueda!
              </p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
