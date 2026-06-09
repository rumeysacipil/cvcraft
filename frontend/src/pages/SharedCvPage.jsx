import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { cvApi } from '../services/api'
import { CVRenderer } from '../components/cv/CVTemplates'
import './DashboardPage.css' // We can reuse some styles
import { useLangStore } from '../store/langStore'
import { translations } from '../i18n/translations'

export function SharedCvPage() {
  const { token } = useParams()
  const [cv, setCv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { lang, toggleLang } = useLangStore()
  const t = translations[lang]

  useEffect(() => {
    cvApi.getShared(token)
      .then(res => {
        setCv(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError(lang === 'TR' ? 'CV bulunamadı veya paylaşımı kapatılmış.' : 'CV not found or unshared.')
        setLoading(false)
      })
  }, [token, lang])

  if (loading) {
    return (
      <div className="db-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div className="db-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }} />
        <p style={{ color: '#64748b', fontWeight: 500 }}>{lang === 'TR' ? 'CV Yükleniyor...' : 'Loading CV...'}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="db-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>📄</div>
        <h2 style={{ color: '#1e293b' }}>{error}</h2>
        <button className="db-btn-solid" onClick={() => navigate('/')}>
          {lang === 'TR' ? 'Ana Sayfaya Git' : 'Go to Home'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px 24px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #4f46e5, #2563eb)', color: 'white', padding: '6px 10px', borderRadius: '8px', fontWeight: 800, fontSize: '14px', letterSpacing: '0.5px' }}>
            CVCraft
          </div>
          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '16px' }}>
            {cv.title}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="db-lang-btn" onClick={toggleLang}>
            {lang === 'TR' ? '🇹🇷 TR' : '🇬🇧 EN'}
          </button>
          <button className="db-btn-solid" onClick={() => navigate('/register')}>
            {lang === 'TR' ? 'Kendi CV\'ni Oluştur' : 'Create Your Own CV'}
          </button>
        </div>
      </header>
      
      <main style={{ flex: 1, padding: '32px 16px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '800px', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
          <CVRenderer theme={cv.theme} data={cv.data || {}} lang={lang} />
        </div>
      </main>
    </div>
  )
}
