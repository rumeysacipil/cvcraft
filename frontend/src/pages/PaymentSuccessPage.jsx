import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { paymentApi } from '../services/api'

export function PaymentSuccessPage() {
  const navigate = useNavigate()
  const refreshUser = useAuthStore(s => s.refreshUser)
  const [status, setStatus] = useState('loading') // 'loading' | 'premium' | 'credits' | 'pending'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')

    // No session_id → not a real payment redirect, go to dashboard
    if (!sessionId) {
      navigate('/dashboard')
      return
    }

    const finalize = async () => {
      try {
        await refreshUser()
      } catch (_) {}
      const user = useAuthStore.getState().user
      if (user?.isPremium) {
        setStatus('premium')
      } else if ((user?.pdfCredits || 0) > 0) {
        setStatus('credits')
      } else {
        setStatus('pending')
      }
      setTimeout(() => navigate('/dashboard'), 3500)
    }

    paymentApi.verifySession(sessionId)
      .then(finalize)
      .catch(finalize)
  }, [navigate, refreshUser])

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontFamily: "'Inter', -apple-system, sans-serif"
  }

  if (status === 'loading') {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⟳</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Ödeme Doğrulanıyor...</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Lütfen bekleyin.</p>
        </div>
      </div>
    )
  }

  if (status === 'premium') {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Ödeme Başarılı!</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '8px' }}>⭐ Premium üyeliğin aktif edildi.</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Dashboard'a yönlendiriliyorsun...</p>
        </div>
      </div>
    )
  }

  if (status === 'credits') {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Ödeme Başarılı!</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '8px' }}>PDF indirme hakkın eklendi.</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Dashboard'a yönlendiriliyorsun...</p>
        </div>
      </div>
    )
  }

  // 'pending' — webhook not yet processed but payment was submitted
  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>⏳</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>Ödemen alındı!</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '8px' }}>Premium üyeliğin birkaç dakika içinde aktif olacak.</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Dashboard'a yönlendiriliyorsun...</p>
      </div>
    </div>
  )
}
