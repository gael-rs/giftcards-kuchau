"use client"
import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import Giftcard from '@/components/Giftcard'

export default function GenerateGiftcardImage() {
  const giftcardRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('Generando imagen...')

  const handleGenerate = async () => {
    if (!giftcardRef.current) return

    try {
      setStatus('Capturando giftcard...')
      const canvas = await html2canvas(giftcardRef.current, {
        backgroundColor: '#facc15',
        scale: 2,
        logging: false,
        useCORS: true,
      })

      setStatus('Convirtiendo a imagen...')
      const dataUrl = canvas.toDataURL('image/png')
      
      // Descargar la imagen
      const link = document.createElement('a')
      link.download = `giftcard-default.png`
      link.href = dataUrl
      link.click()

      // También intentar guardar en el servidor
      try {
        setStatus('Guardando en servidor...')
        const response = await fetch('/api/save-giftcard-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: dataUrl, filename: 'giftcard-default.png' })
        })
        
        if (response.ok) {
          setStatus('✅ Imagen generada y guardada exitosamente!')
        } else {
          setStatus('✅ Imagen generada (guarda manualmente en public/giftcards/)')
        }
      } catch (error) {
        setStatus('✅ Imagen generada (guarda manualmente en public/giftcards/giftcard-default.png)')
      }

      setStatus('✅ Imagen descargada! Colócala en public/giftcards/giftcard-default.png')
    } catch (error) {
      console.error('Error generando imagen:', error)
      setStatus('❌ Error al generar la imagen')
      alert('Error al generar la imagen')
    }
  }

  useEffect(() => {
    // Generar automáticamente al cargar
    setTimeout(() => {
      handleGenerate()
    }, 1500)
  }, [])

  return (
    <div className="min-h-screen bg-[#0e1115] flex items-center justify-center p-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Generador de Imagen Giftcard</h1>
          <p className="text-gray-400 mb-4">{status}</p>
          <p className="text-sm text-gray-500 mb-6">
            Esta será la imagen por defecto para todas las giftcards (excepto la #123)
          </p>
          <button
            onClick={handleGenerate}
            className="px-6 py-3 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition-colors"
          >
            🔄 Regenerar Imagen
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Coloca la imagen descargada en: public/giftcards/giftcard-default.png
          </p>
        </div>
        <div className="flex justify-center">
          <div ref={giftcardRef} className="bg-white p-4 rounded-lg">
            <Giftcard code="CODIGO-EJEMPLO" id={1} />
          </div>
        </div>
      </div>
    </div>
  )
}

