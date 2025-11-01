"use client"
import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCookie, setCookie, deleteCookie } from '@/lib/cookies'

export default function HomePage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Si ya hay un token, redirigir al dashboard
    const token = getCookie('token')
    if (token) {
      // Verificar que el token sea válido
      fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            router.push('/dashboard')
          } else {
            deleteCookie('token')
          }
        })
        .catch(() => {
          deleteCookie('token')
        })
    }
  }, [router])

  const onLetterClick = useCallback((letter: string) => {
    if (letter === 'G') return alert('1')
    if (letter === 'I') return alert('2')
    if (letter === 'F') return alert('3')
    // otras letras no hacen nada
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    
    if (!username || !password) {
      setMessage('Por favor completa todos los campos')
      return
    }

    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message || 'Operación exitosa')
        if (isLogin) {
          // Guardar token en cookie
          if (data.token) {
            setCookie('token', data.token)
            // Redirigir al dashboard
            window.location.href = '/dashboard'
          } else {
            alert(`¡Bienvenido ${data.user.username}!`)
          }
        } else {
          alert('¡Registro exitoso! Ahora puedes iniciar sesión.')
          setIsLogin(true)
          setUsername('')
          setPassword('')
        }
      } else {
        setMessage(data.error || 'Error en la operación')
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('Error de conexión. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="relative min-h-screen bg-[#0e1115]">
      <div className="ambient-grid" />
      {/* Burbujas: "GIFT" a la izquierda y "CARD" a la derecha (posiciones fijas) */}
      <div className="bubbles">
        <div className="bubbles-fixed">
          {/* GIFT - izquierda dispuestos en fila vertical y ligera curva */}
          <button type="button" onClick={() => onLetterClick('G')} className="bubble bubble-cyan bubble-abs text-2xl cursor-pointer" style={{ left: '6%', top: '44%', zIndex: 15, pointerEvents: 'auto' }}>G</button>
          <button type="button" onClick={() => onLetterClick('I')} className="bubble bubble-cyan bubble-abs text-2xl cursor-pointer" style={{ left: '10%', top: '47%', zIndex: 15, pointerEvents: 'auto' }}>I</button>
          <button type="button" onClick={() => onLetterClick('F')} className="bubble bubble-cyan bubble-abs text-2xl cursor-pointer" style={{ left: '14%', top: '50%', zIndex: 15, pointerEvents: 'auto' }}>F</button>
          <button type="button" onClick={() => onLetterClick('T')} className="bubble bubble-abs text-2xl cursor-pointer" style={{ left: '18%', top: '53%', zIndex: 15, pointerEvents: 'auto' }}>T</button>

          {/* CARD - derecha en fila */}
          <button type="button" onClick={() => onLetterClick('C')} className="bubble bubble-abs text-2xl cursor-pointer" style={{ right: '18%', top: '53%', zIndex: 15, pointerEvents: 'auto' }}>C</button>
          <button type="button" onClick={() => onLetterClick('A')} className="bubble bubble-abs text-2xl cursor-pointer" style={{ right: '14%', top: '50%', zIndex: 15, pointerEvents: 'auto' }}>A</button>
          <button type="button" onClick={() => onLetterClick('R')} className="bubble bubble-abs text-2xl cursor-pointer" style={{ right: '10%', top: '47%', zIndex: 15, pointerEvents: 'auto' }}>R</button>
          <button type="button" onClick={() => onLetterClick('D')} className="bubble bubble-abs text-2xl cursor-pointer" style={{ right: '6%', top: '44%', zIndex: 15, pointerEvents: 'auto' }}>D</button>
        </div>
      </div>

      {/* Centered stack */}
      <div className="relative z-50 flex min-h-screen flex-col items-center justify-center px-6">

        <div className="w-full max-w-md rounded-2xl panel-bg border border-yellow-400/40 neon-outline p-6 sm:p-8 relative z-50">
          <h2 className="text-2xl font-semibold text-white text-center mb-6">
            {isLogin ? 'Iniciar sesión' : 'Registrarse'}
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Username</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg bg-slate-900/60 border border-yellow-400/30 focus:border-yellow-300 focus:outline-none px-3 py-2 text-white placeholder-gray-400" 
                placeholder="tuusuario" 
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-900/60 border border-yellow-400/30 focus:border-yellow-300 focus:outline-none px-3 py-2 text-white placeholder-gray-400" 
                placeholder="••••••••" 
                disabled={loading}
              />
            </div>
            {message && (
              <div className={`text-sm text-center p-2 rounded ${message.includes('Error') || message.includes('incorrectos') || message.includes('en uso') ? 'text-red-400' : 'text-green-400'}`}>
                {message}
              </div>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 px-5 py-3 rounded-lg font-bold neon-bg neon-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : isLogin ? 'Entrar' : 'Registrarse'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-4">
            {isLogin ? (
              <>¿No tienes cuenta? <span className="text-yellow-300 cursor-pointer hover:text-yellow-200" onClick={() => { setIsLogin(false); setMessage(''); setUsername(''); setPassword('') }}>Regístrate</span></>
            ) : (
              <>¿Ya tienes cuenta? <span className="text-yellow-300 cursor-pointer hover:text-yellow-200" onClick={() => { setIsLogin(true); setMessage(''); setUsername(''); setPassword('') }}>Inicia sesión</span></>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
