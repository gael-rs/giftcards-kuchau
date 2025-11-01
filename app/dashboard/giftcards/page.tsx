"use client"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Giftcard from '@/components/Giftcard'
import { getCookie } from '@/lib/cookies'

export default function GiftcardsPage() {
  const router = useRouter()
  const [giftcards, setGiftcards] = useState<any[]>([])
  const [filteredGiftcards, setFilteredGiftcards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchId, setSearchId] = useState('')

  useEffect(() => {
    loadGiftcards()
  }, [])

  const loadGiftcards = async () => {
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
        const allGiftcards = data.giftcards || []
        setGiftcards(allGiftcards)
        setFilteredGiftcards(allGiftcards)
      }
    } catch (error) {
      console.error('Error cargando giftcards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewGiftcard = (number: number) => {
    router.push(`/dashboard/giftcards/${number}`)
  }

  const handleSearch = () => {
    const searchNumber = searchId.trim()
    
    if (!searchNumber) {
      // Si está vacío, mostrar todas
      setFilteredGiftcards(giftcards)
      return
    }

    const id = parseInt(searchNumber)
    if (!isNaN(id) && id > 0) {
      // Filtrar giftcards por número
      const filtered = giftcards.filter(gc => gc.number === id)
      setFilteredGiftcards(filtered)
    } else {
      // Si no es un número válido, mostrar todas
      setFilteredGiftcards(giftcards)
    }
  }

  useEffect(() => {
    // Filtrar cuando cambia el searchId
    if (!searchId.trim()) {
      setFilteredGiftcards(giftcards)
    } else {
      const id = parseInt(searchId)
      if (!isNaN(id) && id > 0) {
        const filtered = giftcards.filter(gc => gc.number === id)
        setFilteredGiftcards(filtered)
      } else {
        setFilteredGiftcards(giftcards)
      }
    }
  }, [searchId, giftcards])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center text-white">Cargando giftcards...</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl panel-bg border border-yellow-400/40 neon-outline p-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Mis Giftcards</h2>
          <p className="text-gray-400">Busca y visualiza tus giftcards</p>
        </div>

        <div className="grid gap-8">
          {/* Buscador de Giftcards */}
          <div className="rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-yellow-400/30 p-6">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              <span>🔍</span> Buscar Giftcard
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="number"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                  placeholder="Filtrar por número (deja vacío para ver todas)"
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-800/80 border border-yellow-400/30 text-white placeholder-gray-400 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 rounded-lg font-bold neon-bg neon-ring hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-yellow-400/20"
                >
                  Buscar
                </button>
                {searchId && (
                  <button
                    onClick={() => {
                      setSearchId('')
                      setFilteredGiftcards(giftcards)
                    }}
                    className="px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 text-center">
                {searchId 
                  ? `Mostrando ${filteredGiftcards.length} de ${giftcards.length} giftcards` 
                  : `Total: ${giftcards.length} giftcards`}
              </p>
            </div>
          </div>

          {/* Lista de Giftcards */}
          {filteredGiftcards.length > 0 ? (
            <div className="rounded-xl bg-slate-900/60 border border-yellow-400/30 p-4">
              <h3 className="text-base font-semibold text-yellow-300 mb-4">
                Giftcards {searchId ? `(#${searchId})` : `(${filteredGiftcards.length})`}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredGiftcards.map((gc) => (
                  <div
                    key={gc.id}
                    className="relative group h-[140px]"
                  >
                    <div
                      onClick={() => handleViewGiftcard(gc.number)}
                      className="cursor-pointer transform hover:scale-105 transition-transform h-full"
                    >
                      <Giftcard code={gc.code} id={gc.number} imageUrl={gc.imageUrl} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-900/60 border border-yellow-400/30 p-8 text-center">
              <p className="text-gray-400 mb-4">
                {searchId ? `No se encontró giftcard con el número ${searchId}` : 'No hay giftcards disponibles.'}
              </p>
              {searchId && (
                <button
                  onClick={() => {
                    setSearchId('')
                    setFilteredGiftcards(giftcards)
                  }}
                  className="px-4 py-2 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 font-semibold transition-colors"
                >
                  Mostrar todas
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
