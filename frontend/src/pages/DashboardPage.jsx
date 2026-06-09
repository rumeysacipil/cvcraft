import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cvApi, paymentApi, userApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useLangStore } from '../store/langStore'
import { translations as dashboardTranslations } from '../i18n/translations'
import { TEMPLATES_CATALOG } from '../components/cv/CVTemplates'
import './DashboardPage.css'

// ─── Category Maps ──────────────────────────────────────────────────────────
const CAT_ICONS = {
  Genel: '📄', Yazılım: '💻', Kurumsal: '🏢',
  Kreatif: '🎨', Akademik: '🎓', Sağlık: '🏥', Hukuk: '⚖️'
}
const CAT_COLORS = {
  Genel: '#8b5cf6', Yazılım: '#3b82f6', Kurumsal: '#1e40af',
  Kreatif: '#ec4899', Akademik: '#10b981', Sağlık: '#0d9488', Hukuk: '#6366f1'
}
const CAT_NAMES_EN = {
  Genel: 'General', Yazılım: 'Software', Kurumsal: 'Corporate',
  Kreatif: 'Creative', Akademik: 'Academic', Sağlık: 'Healthcare', Hukuk: 'Legal'
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export function DashboardPage() {
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [copyingId, setCopyingId] = useState(null)
  const [activeNav, setActiveNav] = useState('cvs')
  const { user, logout, refreshUser } = useAuthStore()
  const { lang, toggleLang } = useLangStore()
  const t = dashboardTranslations[lang]
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isTR = lang === 'TR'

  // Share modal state
  const [shareModalCv, setShareModalCv] = useState(null)
  const [shareLoading, setShareLoading] = useState(false)

  // Profile edit state
  const [profileEdit, setProfileEdit] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [cancelingSubscription, setCancelingSubscription] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert(isTR ? 'Lütfen sadece PDF yükleyin.' : 'Please upload a PDF only.')
      return
    }
    setImporting(true)
    try {
      const { data } = await cvApi.importPdf(file)
      setCvs(prev => [data, ...prev])
      navigate(`/editor/${data.id}`)
    } catch {
      alert(isTR ? 'PDF okunurken bir hata oluştu.' : 'Failed to parse PDF.')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const openShareModal = (cv, e) => {
    e.stopPropagation()
    setShareModalCv(cv)
  }

  const toggleShareStatus = async () => {
    if (!shareModalCv) return
    setShareLoading(true)
    try {
      const { data } = await cvApi.toggleShare(shareModalCv.id)
      const updatedCv = { ...shareModalCv, isPublic: data.isPublic, shareToken: data.shareToken }
      setCvs(prev => prev.map(c => c.id === shareModalCv.id ? updatedCv : c))
      setShareModalCv(updatedCv)
    } catch {
      alert(isTR ? 'Paylaşım durumu değiştirilemedi.' : 'Error changing share status.')
    } finally {
      setShareLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (!shareModalCv?.shareToken) return
    const link = `${window.location.origin}/shared/${shareModalCv.shareToken}`
    navigator.clipboard.writeText(link)
    alert(isTR ? 'Link kopyalandı!' : 'Link copied!')
  }

  useEffect(() => {
    cvApi.list()
      .then(r => { setCvs(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (searchParams.get('upgrade')) handleUpgrade()
  }, [])

  const handleCopy = async (cv, e) => {
    e.stopPropagation()
    setCopyingId(cv.id)
    try {
      const copyLabel = isTR ? ' (Kopya)' : ' (Copy)'
      const { data } = await cvApi.create({ title: cv.title + copyLabel, theme: cv.theme, data: cv.data || {} })
      setCvs(prev => [data, ...prev])
    } catch (err) {
      if (err.response?.status === 402) handleUpgrade()
      else alert(t.copyError)
    } finally {
      setCopyingId(null)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm(isTR ? 'Bu CV silinsin mi?' : 'Delete this CV?')) return
    await cvApi.delete(id)
    setCvs(cvs.filter(c => c.id !== id))
  }

  const handleUpgrade = async (type = 'subscription') => {
    setCheckoutLoading(true)
    try {
      const fn = type === 'one-time' ? paymentApi.oneTimeCheckout : paymentApi.subscriptionCheckout
      const { data } = await fn()
      window.location.href = data.url
    } catch {
      alert(t.paymentError)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    const msg = isTR
      ? 'Aboneliğinizi iptal etmek istediğinizden emin misiniz? Premium erişiminiz dönemin sonunda sona erecek.'
      : 'Are you sure you want to cancel your subscription? Your premium access will end at the end of the current period.'
    if (!confirm(msg)) return
    setCancelingSubscription(true)
    try {
      await paymentApi.cancelSubscription()
      await refreshUser()
      setProfileMsg({ ok: true, text: isTR ? 'Abonelik iptal edildi. Dönem sonunda Free plana geçeceksiniz.' : 'Subscription cancelled. You will be downgraded at the end of the billing period.' })
    } catch {
      setProfileMsg({ ok: false, text: isTR ? 'İptal işlemi başarısız. Lütfen tekrar deneyin.' : 'Cancellation failed. Please try again.' })
    } finally {
      setCancelingSubscription(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profileName.trim() || profileName.trim().length < 2) {
      setProfileMsg({ ok: false, text: isTR ? 'Ad en az 2 karakter olmalıdır.' : 'Name must be at least 2 characters.' })
      return
    }
    setProfileSaving(true)
    try {
      await userApi.update({ name: profileName.trim() })
      await refreshUser()
      setProfileMsg({ ok: true, text: isTR ? 'Profil güncellendi!' : 'Profile updated!' })
      setProfileEdit(false)
      setTimeout(() => setProfileMsg(null), 3000)
    } catch {
      setProfileMsg({ ok: false, text: isTR ? 'Güncelleme başarısız.' : 'Update failed.' })
    } finally {
      setProfileSaving(false)
    }
  }

  const startProfileEdit = () => {
    setProfileName(user?.name || '')
    setProfileEdit(true)
    setProfileMsg(null)
  }

  const themeLabel = (theme) => {
    if (!theme) return 'Minimal'
    const found = TEMPLATES_CATALOG.find(t => t.id === theme)
    return found ? found.name : theme.split('-').slice(0, 2).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
  }

  const themeCategory = (theme) => {
    const found = TEMPLATES_CATALOG.find(t => t.id === theme)
    return found?.category || 'Genel'
  }

  const TR_CATS = ['Genel', 'Yazılım', 'Kurumsal', 'Kreatif', 'Akademik', 'Sağlık', 'Hukuk']
  const freeCats = TR_CATS.map(cat => ({
    key: cat,
    name: isTR ? cat : (CAT_NAMES_EN[cat] || cat),
    icon: CAT_ICONS[cat] || '📄',
    free: TEMPLATES_CATALOG.filter(t => t.category === cat && !t.premium).length,
    total: TEMPLATES_CATALOG.filter(t => t.category === cat).length,
    color: CAT_COLORS[cat],
  }))

  const totalTemplates = TEMPLATES_CATALOG.length
  const freeTemplates = TEMPLATES_CATALOG.filter(t => !t.premium).length
  const userName = user?.name || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  const navItems = [
    { key: 'cvs', icon: '📋', label: isTR ? "CV'lerim" : 'My CVs' },
    { key: 'analytics', icon: '📊', label: isTR ? 'Analitik' : 'Analytics' },
    { key: 'profile', icon: '👤', label: isTR ? 'Profil' : 'Profile' },
  ]

  return (
    <div className="db-root">
      {/* ── Sidebar ── */}
      <aside className="db-sidebar">
        <div className="db-sidebar-logo">
          <div className="db-logo-icon">CV</div>
          <span className="db-logo-text">CVCraft</span>
        </div>

        <nav className="db-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`db-nav-item ${activeNav === item.key ? 'active' : ''}`}
              onClick={() => setActiveNav(item.key)}
            >
              <span className="db-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div style={{ marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
            <button className="db-nav-item" onClick={() => navigate('/templates')}>
              <span className="db-nav-icon">🎨</span>
              {isTR ? 'Şablonlar' : 'Templates'}
            </button>
          </div>
        </nav>

        <div className="db-sidebar-bottom">
          <div className="db-user-card" onClick={() => setActiveNav('profile')}>
            <div className="db-avatar">{userInitial}</div>
            <div className="db-user-info">
              <div className="db-user-name">{userName}</div>
              <div className="db-user-plan">
                {user?.isPremium ? (isTR ? '⭐ Premium' : '⭐ Premium') : (isTR ? 'Ücretsiz Plan' : 'Free Plan')}
              </div>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>→</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="db-main">
        {/* ── Top Bar ── */}
        <header className="db-topbar">
          <div className="db-topbar-left">
            <h2>{isTR ? `Hoş geldin, ${userName}!` : `Welcome Back, ${userName}!`}</h2>
            <p>{isTR ? "CV'lerini düzenle ve yönet" : 'Manage and edit your CVs'}</p>
          </div>
          <div className="db-topbar-right">
            {user?.isPremium && <span className="db-premium-badge">✨ {t.premium}</span>}
            <button className="db-lang-btn" onClick={toggleLang}>
              {lang === 'TR' ? '🇹🇷 TR' : '🇬🇧 EN'}
            </button>
            <button className="db-icon-btn" title={isTR ? 'Bildirimler' : 'Notifications'}>🔔</button>
            <button className="db-icon-btn" onClick={logout} title={t.logout} style={{ color: '#ef4444' }}>⏻</button>
            <button className="db-create-btn" onClick={() => navigate('/templates')}>
              + {isTR ? 'Yeni CV' : 'Create New CV'}
            </button>
          </div>
        </header>

        {/* ── Scroll Content ── */}
        <div className="db-scroll">
          {activeNav === 'cvs' && (<>

          {/* ── Upgrade Banner ── */}
          {!user?.isPremium && (
            <div className="db-upgrade-banner">
              <div className="db-upgrade-content">
                <div className="db-upgrade-title">
                  ✨ {isTR ? "Premium'a Geç" : 'Upgrade to Premium'}
                </div>
                <p className="db-upgrade-desc">
                  {isTR
                    ? 'Sınırsız CV, 60+ premium şablon, PDF export, AI analizi ve daha fazlası'
                    : 'Unlimited CVs, 60+ premium templates, PDF export, AI analysis and more'}
                </p>
              </div>
              <div className="db-upgrade-btns">
                <button className="db-btn-outline" onClick={() => handleUpgrade('one-time')} disabled={checkoutLoading}>
                  {isTR ? '₺29 — Tek PDF' : '$9 — Single PDF'}
                </button>
                <button className="db-btn-solid" onClick={() => handleUpgrade('subscription')} disabled={checkoutLoading}>
                  {isTR ? '₺149/ay — Premium' : '$14/mo — Premium'}
                </button>
              </div>
            </div>
          )}

          {/* ── Stats ── */}
          <div className="db-stats-grid">
            {/* CV'lerim — scroll to cvs section */}
            <div
              className="db-stat-card db-stat-card--link"
              style={{ '--stat-bar': 'linear-gradient(90deg,#4f46e5,#818cf8)', '--stat-bg': '#eff6ff' }}
              onClick={() => { setActiveNav('cvs'); document.getElementById('cvs-section')?.scrollIntoView({ behavior: 'smooth' }) }}
              title={isTR ? "CV'lerime git" : 'Go to My CVs'}
            >
              <div className="db-stat-icon">📋</div>
              <div className="db-stat-val">{cvs.length}</div>
              <div className="db-stat-lbl">{isTR ? "CV'lerim" : 'My CVs'}</div>
              <div className="db-stat-arrow">→</div>
            </div>

            {/* Toplam Şablon */}
            <div
              className="db-stat-card db-stat-card--link"
              style={{ '--stat-bar': 'linear-gradient(90deg,#2563eb,#60a5fa)', '--stat-bg': '#eff6ff' }}
              onClick={() => navigate('/templates')}
              title={isTR ? 'Tüm Şablonlar' : 'All Templates'}
            >
              <div className="db-stat-icon">🎨</div>
              <div className="db-stat-val">{totalTemplates}</div>
              <div className="db-stat-lbl">{isTR ? 'Toplam Şablon' : 'Total Templates'}</div>
              <div className="db-stat-arrow">→</div>
            </div>

            {/* Ücretsiz Şablon */}
            <div
              className="db-stat-card db-stat-card--link"
              style={{ '--stat-bar': 'linear-gradient(90deg,#10b981,#34d399)', '--stat-bg': '#f0fdf4' }}
              onClick={() => navigate('/templates?filter=free')}
              title={isTR ? 'Ücretsiz Şablonlar' : 'Free Templates'}
            >
              <div className="db-stat-icon">✓</div>
              <div className="db-stat-val">{freeTemplates}</div>
              <div className="db-stat-lbl">{isTR ? 'Ücretsiz Şablon' : 'Free Templates'}</div>
              <div className="db-stat-arrow">→</div>
            </div>

            {/* AI Destekli Analiz */}
            <div
              className="db-stat-card db-stat-card--link"
              style={{ '--stat-bar': 'linear-gradient(90deg,#f59e0b,#fbbf24)', '--stat-bg': '#fffbeb' }}
              onClick={() => setActiveNav('analytics')}
              title={isTR ? 'AI Analizine Git' : 'Go to AI Analytics'}
            >
              <div className="db-stat-icon">🤖</div>
              <div className="db-stat-val">AI</div>
              <div className="db-stat-lbl">{isTR ? 'Destekli Analiz' : 'Powered Analysis'}</div>
              <div className="db-stat-arrow">→</div>
            </div>
          </div>

          {/* ── Template Categories ── */}
          <div style={{ marginBottom: '28px' }}>
            <div className="db-section-header">
              <h2 className="db-section-title">
                🎨 {isTR ? 'Şablon Kategorileri' : 'Template Categories'}
              </h2>
              <button className="db-view-all-btn" onClick={() => navigate('/templates')}>
                {isTR ? 'Tümünü Gör →' : 'View All →'}
              </button>
            </div>
            <div className="db-cat-grid">
              {freeCats.map((cat) => (
                <div
                  key={cat.key}
                  className="db-cat-card"
                  style={{ '--cat-c': cat.color }}
                  onClick={() => navigate(`/templates?cat=${cat.key}`)}
                >
                  <span className="db-cat-emoji">{cat.icon}</span>
                  <div className="db-cat-name">{cat.name}</div>
                  <div className="db-cat-count">
                    {cat.free} {isTR ? 'ücretsiz' : 'free'} / {cat.total}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── My CVs ── */}
          <div id="cvs-section">
            <div className="db-section-header">
              <h1 className="db-section-title">
                📋 {isTR ? "CV'lerim" : 'My CVs'}
                <span className="db-section-count">({cvs.length})</span>
              </h1>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  style={{ display: 'none' }} 
                  ref={fileInputRef} 
                  onChange={handleImport} 
                />
                <button className="db-view-all-btn" onClick={() => fileInputRef.current?.click()} disabled={importing}>
                  {importing ? `⟳ ${t.importLoading}` : `📄 ${t.importBtn}`}
                </button>
                <button className="db-view-all-btn" onClick={() => navigate('/templates')}>
                  {isTR ? '🎨 Şablon Galerisi' : '🎨 Gallery'}
                </button>
                <button className="db-create-btn" onClick={() => navigate('/templates')}>
                  + {isTR ? 'Yeni CV' : 'New CV'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="db-loading">
                <div className="db-spinner" />
                <span className="db-loading-txt">{isTR ? 'Yükleniyor...' : 'Loading...'}</span>
              </div>
            ) : cvs.length === 0 ? (
              <div className="db-empty">
                <span className="db-empty-icon">📄</span>
                <h2 className="db-empty-title">{isTR ? "Henüz CV'in yok" : 'No CVs yet'}</h2>
                <p className="db-empty-desc">{isTR ? 'Bir şablon seçerek ilk CV\'ini oluştur' : 'Choose a template to create your first CV'}</p>
                <button className="db-create-btn" onClick={() => navigate('/templates')}>
                  🎨 {isTR ? 'Şablon Seç' : 'Choose Template'}
                </button>
              </div>
            ) : (
              <div className="db-cv-grid">
                {cvs.map((cv) => {
                  const cat = themeCategory(cv.theme)
                  const catColor = CAT_COLORS[cat] || '#4f46e5'
                  return (
                    <div
                      key={cv.id}
                      className="db-cv-card"
                      onClick={() => navigate(`/editor/${cv.id}`)}
                    >
                      {/* Thumbnail */}
                      <div className="db-cv-thumb" style={{ background: `linear-gradient(135deg, ${catColor}10, ${catColor}20)` }}>
                        <div className="db-cv-thumb-lines" style={{ '--thumb-c': catColor }}>
                          <div className="db-cv-thumb-line accent" style={{ width: '60%' }} />
                          <div className="db-cv-thumb-line" />
                          <div className="db-cv-thumb-line" style={{ width: '80%' }} />
                          <div className="db-cv-thumb-line" style={{ width: '50%' }} />
                          <div className="db-cv-thumb-line" />
                          <div className="db-cv-thumb-line" style={{ width: '70%' }} />
                        </div>
                        <div className="db-cv-thumb-badge" style={{ color: catColor }}>
                          {CAT_ICONS[cat] || '📄'} {themeLabel(cv.theme).split(' ')[0]}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="db-cv-body">
                        <div className="db-cv-title-row">
                          <div className="db-cv-emoji" style={{ background: `${catColor}15`, color: catColor }}>
                            {CAT_ICONS[cat] || '📄'}
                          </div>
                          <span className="db-cv-title" title={cv.title}>{cv.title}</span>
                        </div>
                        <div className="db-cv-theme">
                          <span className="db-cv-dot" style={{ background: catColor }} />
                          {themeLabel(cv.theme)}
                        </div>
                        <div className="db-cv-date">
                          {isTR ? 'Son düzenleme: ' : 'Last edited '}
                          {new Date(cv.updatedAt).toLocaleDateString(
                            isTR ? 'tr-TR' : 'en-US',
                            { day: 'numeric', month: 'short', year: 'numeric' }
                          )}
                        </div>

                        <div className="db-cv-footer">
                          <span className="db-cv-edit-link">
                            {isTR ? 'Düzenle' : 'Edit'} →
                          </span>
                          <div className="db-cv-actions">
                            <button
                              className="db-cv-btn-copy"
                              onClick={e => openShareModal(cv, e)}
                              style={{ color: cv.isPublic ? '#10b981' : undefined }}
                            >
                              {cv.isPublic ? (isTR ? '🔗 Paylaşılıyor' : '🔗 Sharing') : (isTR ? '🔗 Paylaş' : '🔗 Share')}
                            </button>
                            <button
                              className="db-cv-btn-copy"
                              onClick={e => handleCopy(cv, e)}
                              disabled={copyingId === cv.id}
                            >
                              {copyingId === cv.id ? '⟳' : (isTR ? '⧉ Kopya' : '⧉ Copy')}
                            </button>
                            <button
                              className="db-cv-btn-delete"
                              onClick={e => handleDelete(cv.id, e)}
                            >
                              {isTR ? '✕ Sil' : '✕ Del'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          </>)}

          {/* ── Analytics ── */}
          {activeNav === 'analytics' && (
            <div>
              <div className="db-section-header">
                <h2 className="db-section-title">📊 {isTR ? 'Kullanım Analitiği' : 'Usage Analytics'}</h2>
              </div>
              <div className="db-stats-grid" style={{ marginBottom: '32px' }}>
                <div className="db-stat-card" style={{ '--stat-bar': 'linear-gradient(90deg,#4f46e5,#818cf8)', '--stat-bg': '#eff6ff' }}>
                  <div className="db-stat-val">{cvs.length}</div>
                  <div className="db-stat-lbl">{isTR ? 'Toplam Oluşturulan CV' : 'Total CVs Created'}</div>
                </div>
                <div className="db-stat-card" style={{ '--stat-bar': 'linear-gradient(90deg,#10b981,#34d399)', '--stat-bg': '#f0fdf4' }}>
                  <div className="db-stat-val">100%</div>
                  <div className="db-stat-lbl">{isTR ? 'ATS Uyum Ortalaması' : 'ATS Compliance Avg'}</div>
                </div>
                <div className="db-stat-card" style={{ '--stat-bar': 'linear-gradient(90deg,#f59e0b,#fbbf24)', '--stat-bg': '#fffbeb' }}>
                  <div className="db-stat-val">{user?.isPremium ? (isTR ? 'Sınırsız' : 'Unlimited') : (user?.pdfCredits || 0)}</div>
                  <div className="db-stat-lbl">{isTR ? 'PDF İndirme Hakkı' : 'PDF Download Credits'}</div>
                </div>
              </div>

              <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center', marginTop: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                  {isTR ? 'İş Başvurusu İstatistikleri Yakında' : 'Job Application Stats Coming Soon'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                  {isTR
                    ? "Hangi CV'nin daha çok geri dönüş aldığını, kapak mektubu performanslarını ve mülakat davet oranlarını buradan detaylı grafiklerle takip edebileceksiniz."
                    : "You'll be able to track which CV gets the most callbacks, cover letter performance, and interview rates here with detailed charts."}
                </p>
              </div>
            </div>
          )}

          {/* ── Profile ── */}
          {activeNav === 'profile' && (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              {/* Header Card */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #4f46e5, #2563eb)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', flexShrink: 0 }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>{userName}</h2>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>{user?.email}</p>
                    <p style={{ color: user?.isPremium ? '#10b981' : '#94a3b8', fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>
                      {user?.isPremium ? '⭐ Premium' : (isTR ? 'Ücretsiz Plan' : 'Free Plan')}
                    </p>
                  </div>
                  {!profileEdit && (
                    <button
                      onClick={startProfileEdit}
                      style={{ padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontSize: '13px', fontWeight: 600, flexShrink: 0, fontFamily: "'Inter',sans-serif", transition: 'all 0.2s' }}
                    >
                      ✏️ {isTR ? 'Düzenle' : 'Edit'}
                    </button>
                  )}
                </div>

                {/* Profile Message */}
                {profileMsg && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', background: profileMsg.ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${profileMsg.ok ? '#bbf7d0' : '#fecaca'}`, color: profileMsg.ok ? '#166534' : '#dc2626', fontWeight: 500 }}>
                    {profileMsg.ok ? '✓' : '⚠'} {profileMsg.text}
                  </div>
                )}

                {/* Edit Form */}
                {profileEdit ? (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {isTR ? 'Profili Düzenle' : 'Edit Profile'}
                    </h3>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      {isTR ? 'Ad Soyad' : 'Full Name'}
                      <span style={{ fontWeight: 400, color: '#94a3b8' }}>{profileName.length}/100</span>
                    </label>
                    <input
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      maxLength={100}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', color: '#1e293b', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px', fontFamily: "'Inter',sans-serif", transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      placeholder={isTR ? 'Adınız Soyadınız' : 'Your full name'}
                    />
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      {isTR ? 'E-posta' : 'Email'} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({isTR ? 'değiştirilemez' : 'cannot be changed'})</span>
                    </label>
                    <input
                      value={user?.email || ''}
                      readOnly
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f1f5f9', color: '#94a3b8', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px', fontFamily: "'Inter',sans-serif", cursor: 'not-allowed' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleSaveProfile}
                        disabled={profileSaving}
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #2563eb)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: profileSaving ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif", opacity: profileSaving ? 0.7 : 1 }}
                      >
                        {profileSaving ? (isTR ? 'Kaydediliyor...' : 'Saving...') : (isTR ? '✓ Kaydet' : '✓ Save')}
                      </button>
                      <button
                        onClick={() => { setProfileEdit(false); setProfileMsg(null) }}
                        style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}
                      >
                        {isTR ? 'İptal' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Info Display */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { label: isTR ? 'Ad Soyad' : 'Full Name', value: userName },
                      { label: isTR ? 'E-posta' : 'Email', value: user?.email },
                      { label: isTR ? 'Plan' : 'Plan', value: user?.isPremium ? 'Premium' : (isTR ? 'Ücretsiz' : 'Free') },
                      { label: isTR ? "Toplam CV'lerim" : 'Total CVs', value: cvs.length },
                    ].map((item, i) => (
                      <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>{item.label}</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subscription Card */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {isTR ? 'Abonelik Durumu' : 'Subscription Status'}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: user?.isPremium ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      {user?.isPremium ? '⭐' : '📄'}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                        {user?.isPremium ? (isTR ? 'Premium Plan' : 'Premium Plan') : (isTR ? 'Ücretsiz Plan' : 'Free Plan')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {user?.isPremium
                          ? (isTR ? 'Tüm özellikler açık' : 'All features unlocked')
                          : (isTR ? 'Sınırlı erişim' : 'Limited access')}
                      </div>
                    </div>
                  </div>
                  {!user?.isPremium && (
                    <button className="db-btn-solid" onClick={() => handleUpgrade('subscription')} style={{ padding: '10px 18px', fontSize: '13px' }}>
                      {isTR ? '✨ Yükselt' : '✨ Upgrade'}
                    </button>
                  )}
                </div>
                <p style={{ marginTop: '14px', fontSize: '13px', color: '#64748b', lineHeight: 1.6, padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  {user?.isPremium
                    ? (isTR ? 'Sınırsız PDF, tüm AI özellikleri ve 60+ premium şablona erişiminiz var.' : 'You have unlimited PDFs, all AI features, and access to 60+ premium templates.')
                    : (isTR ? 'Ücretsiz plandasınız. Premium özellikler ve gelişmiş şablonlar kilitli.' : 'You are on the free plan. Premium features and advanced templates are locked.')}
                </p>
                {user?.isPremium && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelingSubscription}
                    style={{ marginTop: '12px', width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: '13px', cursor: cancelingSubscription ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif", opacity: cancelingSubscription ? 0.6 : 1 }}
                  >
                    {cancelingSubscription ? (isTR ? 'İptal ediliyor...' : 'Cancelling...') : (isTR ? '✕ Aboneliği İptal Et' : '✕ Cancel Subscription')}
                  </button>
                )}
              </div>

              {/* Logout */}
              <button className="db-btn-outline" onClick={logout} style={{ width: '100%', color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2', padding: '12px' }}>
                {isTR ? '⏻ Oturumu Kapat' : '⏻ Log Out'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Share Modal ── */}
      {shareModalCv && (
        <div className="db-modal-overlay" onClick={() => setShareModalCv(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="db-modal-content" onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {isTR ? 'CV\'yi Paylaş' : 'Share CV'}
              </h3>
              <button onClick={() => setShareModalCv(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                  {isTR ? 'Herkese Açık Link' : 'Public Link'}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {shareModalCv.isPublic 
                    ? (isTR ? 'Bağlantıya sahip herkes görebilir.' : 'Anyone with the link can view.') 
                    : (isTR ? 'Şu an sadece sen görebilirsin.' : 'Currently only you can view.')}
                </div>
              </div>
              <button 
                onClick={toggleShareStatus} 
                disabled={shareLoading}
                style={{ 
                  background: shareModalCv.isPublic ? '#10b981' : '#e2e8f0', 
                  border: 'none', borderRadius: '20px', width: '44px', height: '24px', position: 'relative', cursor: shareLoading ? 'not-allowed' : 'pointer', transition: 'all 0.3s' 
                }}
              >
                <div style={{ 
                  width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', 
                  left: shareModalCv.isPublic ? '23px' : '3px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                }} />
              </button>
            </div>

            {shareModalCv.isPublic && shareModalCv.shareToken && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  <input 
                    readOnly 
                    value={`${window.location.origin}/shared/${shareModalCv.shareToken}`} 
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#475569', fontSize: '13px', outline: 'none' }}
                  />
                  <button onClick={handleCopyLink} style={{ padding: '0 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    {isTR ? 'Kopyala' : 'Copy'}
                  </button>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '12px', textAlign: 'center' }}>
                  {isTR ? 'Veya şuradan paylaş:' : 'Or share via:'}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  {/* Download PDF */}
                  <button onClick={() => {
                      cvApi.exportPdf(shareModalCv.id).then(res => {
                        const url = URL.createObjectURL(res.data)
                        const a = document.createElement('a'); a.href = url; a.download = `${shareModalCv.title || 'CV'}.pdf`; a.click()
                        URL.revokeObjectURL(url)
                      }).catch(() => alert(isTR ? 'PDF İndirilemedi' : 'Failed to download PDF'))
                    }} 
                    style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', textDecoration: 'none', boxShadow: '0 4px 10px rgba(79,70,229,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} title={isTR ? "PDF İndir" : "Download PDF"}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </button>
                  {/* WhatsApp */}
                  <a href={`https://wa.me/?text=${encodeURIComponent((isTR ? 'İşte benim CV\'im: ' : 'Here is my CV: ') + window.location.origin + '/shared/' + shareModalCv.shareToken)}`} target="_blank" rel="noreferrer" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', boxShadow: '0 4px 10px rgba(37,211,102,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} title="WhatsApp">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  </a>
                  {/* LinkedIn */}
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/shared/' + shareModalCv.shareToken)}`} target="_blank" rel="noreferrer" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0077b5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', boxShadow: '0 4px 10px rgba(0,119,181,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} title="LinkedIn">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  {/* Twitter / X */}
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + '/shared/' + shareModalCv.shareToken)}&text=${encodeURIComponent(isTR ? 'İşte benim CV\'im' : 'Check out my CV')}`} target="_blank" rel="noreferrer" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} title="X (Twitter)">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  {/* Email */}
                  <a href={`mailto:?subject=${encodeURIComponent(isTR ? 'Benim CV\'im' : 'My CV')}&body=${encodeURIComponent((isTR ? 'Merhaba, CV\'imi buradan inceleyebilirsiniz: ' : 'Hi, you can view my CV here: ') + window.location.origin + '/shared/' + shareModalCv.shareToken)}`} style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ea4335', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', boxShadow: '0 4px 10px rgba(234,67,53,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} title="Email">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
