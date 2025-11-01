"use client"
import { forwardRef } from 'react'

interface GiftcardProps {
  code: string
  id: number
  imageUrl?: string | null
  size?: 'small' | 'large'
}

const Giftcard = forwardRef<HTMLDivElement, GiftcardProps>(({ code, id, imageUrl, size = 'small' }, ref) => {
  // Todas las giftcards usan el mismo UI generado dinámicamente
  const isLarge = size === 'large'
  
  return (
    <div ref={ref} className={`relative w-full mx-auto aspect-[3/4] ${isLarge ? 'max-w-md' : 'max-h-[140px]'}`}>
      {/* Giftcard Card */}
      <div className={`relative bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500 ${isLarge ? 'rounded-2xl shadow-2xl' : 'rounded-lg shadow-lg'} overflow-hidden transform hover:scale-105 transition-transform duration-300 h-full border-2 border-yellow-600/30`}>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent pointer-events-none" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} />
        
        {/* Card Content */}
        <div className={`relative ${isLarge ? 'p-6' : 'p-2'} h-full flex flex-col justify-between`}>
          {/* Header */}
          <div className={`flex justify-between items-start ${isLarge ? 'mb-4' : 'mb-1.5'}`}>
            <div className="min-w-0 flex-1">
              <h3 className={`${isLarge ? 'text-2xl' : 'text-[11px]'} font-black text-gray-900 leading-tight whitespace-nowrap drop-shadow-sm`}>
                Gift Card
              </h3>
              <p className={`${isLarge ? 'text-sm' : 'text-[9px]'} text-gray-700/90 leading-tight whitespace-nowrap mt-0.5 font-medium`}>
                Regalo Especial
              </p>
            </div>
            <div className={`${isLarge ? 'text-4xl' : 'text-base'} flex-shrink-0 drop-shadow-lg`} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
              🎁
            </div>
          </div>

          {/* Code Display - Centrado sin espacio extra */}
          <div className={`${isLarge ? 'mb-4' : 'mb-1.5'}`}>
            <div className={`bg-white/95 ${isLarge ? 'rounded-xl p-5 border-2' : 'rounded-lg p-2 border'} border-gray-900/30 shadow-inner backdrop-blur-sm`}>
              <p className={`${isLarge ? 'text-xs' : 'text-[8px]'} text-gray-700 ${isLarge ? 'mb-2' : 'mb-1'} font-bold uppercase tracking-wider whitespace-nowrap`}>
                Código
              </p>
              <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg ${isLarge ? 'p-4' : 'p-1.5'} shadow-lg border border-gray-950/50 overflow-hidden min-h-0`}>
                <code className={`${isLarge ? 'text-lg' : 'text-[8px]'} font-mono text-yellow-300 select-all text-center block tracking-tighter font-bold whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`} style={{ maxWidth: '100%' }}>
                  {code}
                </code>
              </div>
            </div>
          </div>

          {/* Footer con número */}
          <div className={`flex justify-between items-center`}>
            <div className={`flex ${isLarge ? 'gap-2' : 'gap-1'}`}>
              <div className={`${isLarge ? 'w-10 h-10' : 'w-3 h-3'} rounded-full bg-gray-900/40 shadow-lg border-2 border-gray-900/20`}></div>
              <div className={`${isLarge ? 'w-10 h-10' : 'w-3 h-3'} rounded-full bg-gray-900/30 shadow-lg border-2 border-gray-900/20`}></div>
            </div>
            <div className={`${isLarge ? 'text-sm' : 'text-[9px]'} text-gray-800 font-black whitespace-nowrap drop-shadow-sm`}>
              #{String(id).padStart(6, '0')}
            </div>
          </div>
        </div>

        {/* Holographic effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-200%] hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none" />
      </div>
    </div>
  )
})

Giftcard.displayName = 'Giftcard'

export default Giftcard
