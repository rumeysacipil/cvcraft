import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { cvApi, aiApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useLangStore } from '../store/langStore'
import { CVTemplate, TEMPLATES_CATALOG, PALETTES, FONTS, getTemplateConfig } from '../components/cv/CVTemplates'
import { translations } from '../i18n/translations'

const BLANK_CV = {
  name: '', title: '', email: '', phone: '', location: '', linkedin: '',
  summary: '', experience: [], education: [], skills: [], languages: [], projects: [], certificates: [],
}

const DUMMY_DATA = {
  name: 'Ahmet Yılmaz',
  title: 'Kıdemli Yazılım Mühendisi',
  email: 'ahmet.yilmaz@email.com',
  phone: '+90 555 123 4567',
  location: 'İstanbul, Türkiye',
  linkedin: 'linkedin.com/in/ahmetyilmaz',
  summary: 'Yenilikçi teknolojiler geliştirmeye odaklanmış, 5+ yıl deneyimli yazılım mühendisi. Çevik (Agile) metodolojiler, mikroservis mimarileri ve yüksek ölçeklenebilir sistemler üzerinde derinlemesine tecrübeye sahibim. Kullanıcı dostu ve performanslı uygulamalar geliştirmek temel motivasyonumdur.',
  experience: [
    {
      role: 'Kıdemli Yazılım Mühendisi',
      company: 'Tech Solutions A.Ş.',
      period: 'Oca 2021 - Günümüz',
      desc: 'Şirketin çekirdek mikroservis mimarisinin tasarlanması ve geliştirilmesi. React ve Spring Boot kullanarak e-ticaret platformunun yeniden yazılması, sayfa yüklenme sürelerinin %40 oranında iyileştirilmesi.'
    },
    {
      role: 'Yazılım Geliştirici',
      company: 'Innova Digital',
      period: 'Haz 2018 - Ara 2020',
      desc: 'Finansal veri analizi araçları tasarlanması. Monolitik mimariden mikroservis mimarisine geçiş.'
    }
  ],
  education: [
    {
      school: 'İstanbul Teknik Üniversitesi',
      degree: 'Bilgisayar Mühendisliği (Lisans)',
      period: 'Eyl 2014 - Haz 2018'
    }
  ],
  skills: ['JavaScript (ES6+)', 'React', 'Node.js', 'Java / Spring Boot', 'PostgreSQL', 'Docker / Kubernetes', 'AWS'],
  languages: ['Türkçe (Anadil)', 'İngilizce (C1)', 'Almanca (B1)'],
  projects: [
    {
      name: 'E-Ticaret Performans Optimizasyonu',
      link: 'github.com/ahmetyilmaz/opt-project',
      desc: 'High-traffic e-ticaret siteleri için caching mekanizması geliştirilmesi. Redis ve Node.js kullanılarak yanıt sürelerinin 200ms altına indirilmesi.'
    }
  ],
  certificates: [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: 'Nis 2023'
    }
  ]
}

function cvScore(data) {
  let s = 0
  if (data.name?.trim()) s += 15
  if (data.title?.trim()) s += 10
  if (data.email?.trim()) s += 10
  if (data.phone?.trim()) s += 5
  if (data.location?.trim()) s += 5
  if (data.summary?.trim()?.length > 50) s += 15
  if (data.experience?.length > 0) s += 20
  if (data.education?.length > 0) s += 10
  if (data.skills?.length >= 3) s += 10
  return Math.min(s, 100)
}

// ─── Gerçek ATS Parser ─────────────────────────────────────────────────────
// Gerçek ATS sistemleri PDF/HTML'i düz metne çevirir ve regex ile tarar.
// Bu fonksiyon da aynısını yapar: form state'e değil, render edilmiş CV'e bakar.
function parseAtsFromDom(lang) {
  const el = document.getElementById('cv-print')
  const isTR = lang === 'TR'

  if (!el) {
    return { error: true, msg: isTR ? 'CV önizlemesi yüklenmedi.' : 'CV preview not loaded.' }
  }

  // 1. Ham metin çıkar (ATS'lerin yaptığı gibi HTML taglerini soy)
  const rawText = el.innerText || el.textContent || ''
  const html    = el.innerHTML

  // 2. <table> var mı? (Workday, Taleo gibi ATS'ler tabloları bozar)
  const hasTables = /<table[\s>]/i.test(html)

  // 3. İletişim bilgilerini regex ile çıkar (form'a bakmadan)
  const emailMatch   = rawText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/)
  const phoneMatch   = rawText.match(/(\+?\d[\d\s\-().]{6,}\d)/)
  const linkedInMatch= rawText.match(/linkedin\.com\/in\/[\w\-]+/i)
  const httpMatch    = rawText.match(/https?:\/\/[^\s]+/)

  // 4. Standart bölüm başlıklarını tespit et (ATS section parser)
  const SEC = {
    summary:   /\b(summary|özet|profile|profil|objective|about me|hakkımda)\b/i,
    experience:/\b(experience|deneyim|work history|iş deneyimi|employment|çalışma)\b/i,
    education: /\b(education|eğitim|academic|öğrenim|university|üniversite|okul|school)\b/i,
    skills:    /\b(skills|beceriler|technical skills|teknik|competencies|yetkinlik)\b/i,
    projects:  /\b(projects|projeler|portfolio|uygulamalar)\b/i,
    languages: /\b(languages?|dil|yabancı dil|foreign)\b/i,
    certs:     /\b(certif|sertifika|license|lisans|award|ödül)\b/i,
  }
  const sections = {}
  for (const [key, rx] of Object.entries(SEC)) sections[key] = rx.test(rawText)

  // 5. Tarih/dönem tespiti: ATS iş geçmişini tarihlere göre parse eder
  const yearMatches = [...rawText.matchAll(/\b(20\d{2}|19\d{2})\b/g)]
  const dateCount = yearMatches.length

  // 6. Kelime sayısı (çok kısa CV'ler ATS'de düşük sıralanır)
  const wordCount = rawText.split(/\s+/).filter(w => w.length > 2).length

  // 7. Çok sütunlu layout tespiti (CSS flex sidebar yapıları bazı ATS'leri bozar)
  // ATS'ler soldan sağa, yukarıdan aşağı lineer okur.
  // İki kolon varsa: sağ kolonu sol kolonun altına değil, ortasına parse edebilir.
  const columns = el.querySelectorAll('[style*="display: flex"], [style*="display:flex"]')
  let hasMultiColumn = false
  columns.forEach(col => {
    const children = Array.from(col.children).filter(c => {
      const w = parseInt(c.style.width || '0')
      return w > 50 && w < 250  // sabit genişlikli sütun → iki kolonlu
    })
    if (children.length >= 1) hasMultiColumn = true
  })

  // 8. Birleştirip kontrolleri üret
  const checks = [
    {
      id: 'email',
      label: isTR ? `E-posta${emailMatch ? ': ' + emailMatch[0] : ''}` : `Email${emailMatch ? ': ' + emailMatch[0] : ''}`,
      detail: isTR ? 'ATS e-postayı regex ile tespit eder' : 'ATS detects email via regex',
      ok: !!emailMatch,
      score: emailMatch ? 12 : 0, max: 12,
      tip: isTR ? 'CV metninde geçerli bir e-posta adresi bulunamadı.' : 'No valid email found in CV text.',
    },
    {
      id: 'phone',
      label: isTR ? `Telefon${phoneMatch ? ': ' + phoneMatch[0].trim().slice(0,20) : ''}` : `Phone${phoneMatch ? ': ' + phoneMatch[0].trim().slice(0,20) : ''}`,
      detail: isTR ? 'ATS telefon numarasını rakam dizisi olarak tanır' : 'ATS recognises phone as digit sequence',
      ok: !!phoneMatch,
      score: phoneMatch ? 8 : 0, max: 8,
      tip: isTR ? 'Telefon numarası ATS tarafından tanınamadı. Yalnız rakam ve - + ( ) kullanın.' : 'Phone not recognised by ATS. Use only digits and - + ( ).',
    },
    {
      id: 'sections',
      label: isTR
        ? `Bölümler: ${Object.values(sections).filter(Boolean).length}/${Object.keys(sections).length} tespit edildi`
        : `Sections: ${Object.values(sections).filter(Boolean).length}/${Object.keys(sections).length} detected`,
      detail: isTR ? 'ATS standart başlık kelimelerini arar' : 'ATS looks for standard header keywords',
      ok: Object.values(sections).filter(Boolean).length >= 3,
      score: Math.min(Object.values(sections).filter(Boolean).length * 4, 20), max: 20,
      tip: isTR
        ? `Tespit edilemeyen bölümler: ${Object.entries(sections).filter(([,v])=>!v).map(([k])=>k).join(', ')}. Bölüm başlıklarını İngilizce veya Türkçe standart kelimelerle yazın.`
        : `Not found: ${Object.entries(sections).filter(([,v])=>!v).map(([k])=>k).join(', ')}. Use standard section headers in English or Turkish.`,
      sub: Object.entries(sections).map(([k, found]) => ({ k, found })),
    },
    {
      id: 'dates',
      label: isTR ? `Tarih/Dönem: ${dateCount} yıl ifadesi` : `Dates: ${dateCount} year references`,
      detail: isTR ? 'ATS cronoloji oluştururken yıl sayılarını tarar' : 'ATS scans year numbers to build chronology',
      ok: dateCount >= 2,
      score: Math.min(dateCount * 2, 10), max: 10,
      tip: isTR ? 'Deneyim ve eğitim girişlerine yıl bilgisi ekleyin (ör. 2021-2023).' : 'Add year ranges to experience and education (e.g. 2021-2023).',
    },
    {
      id: 'wordcount',
      label: isTR ? `Kelime Sayısı: ${wordCount}` : `Word Count: ${wordCount}`,
      detail: isTR ? 'Kısa CV\'ler ATS\'de keyword yoğunluğu düşük çıkar' : 'Short CVs score low keyword density in ATS',
      ok: wordCount >= 150,
      score: wordCount >= 300 ? 15 : wordCount >= 150 ? 10 : wordCount >= 80 ? 5 : 2, max: 15,
      tip: isTR ? `CV'niz ${wordCount} kelime içeriyor. ATS için 150+ kelime önerilir (optimal: 300+).` : `Your CV has ${wordCount} words. 150+ recommended for ATS (optimal: 300+).`,
    },
    {
      id: 'tables',
      label: isTR ? (hasTables ? '⛔ HTML Tablo Bulundu' : '✓ Tablo Yok') : (hasTables ? '⛔ HTML Table Found' : '✓ No Tables'),
      detail: isTR ? 'Workday, Taleo, Greenhouse tabloları bozuk okur' : 'Workday, Taleo, Greenhouse misparse tables',
      ok: !hasTables,
      score: hasTables ? 0 : 15, max: 15,
      tip: isTR ? 'CV\'nizde HTML tablosu tespit edildi. Tablolar ATS\'lerin büyük çoğunluğu tarafından yanlış okunur veya tamamen atlanır.' : 'HTML table detected in your CV. Tables are misread or skipped by most ATS systems.',
    },
    {
      id: 'multicolumn',
      label: isTR ? (hasMultiColumn ? '⚠ Çok Sütunlu Layout' : '✓ Tek Sütunlu Layout') : (hasMultiColumn ? '⚠ Multi-column Layout' : '✓ Single-column Layout'),
      detail: isTR ? 'ATS soldan sağa lineer okur; iki kolon metni karıştırabilir' : 'ATS reads left-to-right linearly; two columns may mix text',
      ok: !hasMultiColumn,
      score: hasMultiColumn ? 5 : 20, max: 20,
      tip: isTR ? 'Şablon iki sütunlu. Bazı ATS\'ler (Lever, iCIMS) sütunları yan yana değil, iç içe parse eder. Minimal şablona geçmeyi düşünün.' : 'Template is two-column. Some ATS (Lever, iCIMS) parse columns interleaved. Consider switching to Minimal template.',
    },
  ]

  const total = checks.reduce((s, c) => s + c.score, 0)
  const maxTotal = checks.reduce((s, c) => s + c.max, 0)
  const pct = Math.round((total / maxTotal) * 100)

  const grade = pct >= 85 ? 'A' : pct >= 70 ? 'B' : pct >= 55 ? 'C' : pct >= 40 ? 'D' : 'F'
  const gradeColor = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444' }

  return { checks, total, maxTotal, pct, grade, gradeColor: gradeColor[grade], rawText, wordCount, emailMatch: emailMatch?.[0], phoneMatch: phoneMatch?.[0], linkedIn: linkedInMatch?.[0] }
}


export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, refreshUser } = useAuthStore()
  const { lang, toggleLang } = useLangStore()
  const t = translations[lang]

  const [data, setData] = useState(BLANK_CV)
  const [theme, setTheme] = useState('minimal-midnight-serif')
  const [title, setTitle] = useState('CV')
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [cvLang, setCvLang] = useState(lang)
  const [atsOpen, setAtsOpen] = useState(false)

  // Panel resize
  const [panelWidth, setPanelWidth] = useState(300)
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(300)

  // AI state
  const [aiPanel, setAiPanel] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [targetJob, setTargetJob] = useState('')
  const [targetLang, setTargetLang] = useState('EN')
  const [jobUrl, setJobUrl] = useState('')
  const [coverRole, setCoverRole] = useState('')
  const [coverCompany, setCoverCompany] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [newLang, setNewLang] = useState('')

  // Stale closure fix — ref ile güncel değerlere erişim
  const dataRef = useRef(data)
  const titleRef = useRef(title)
  const themeRef = useRef(theme)
  useEffect(() => { dataRef.current = data }, [data])
  useEffect(() => { titleRef.current = title }, [title])
  useEffect(() => { themeRef.current = theme }, [theme])

  const saveTimer = useRef(null)

  // Drag-to-resize
  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return
      const diff = e.clientX - dragStartX.current
      setPanelWidth(Math.min(580, Math.max(220, dragStartWidth.current + diff)))
    }
    const onUp = () => { isDragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  useEffect(() => {
    if (id?.startsWith('preview-')) {
      const themeId = id.replace('preview-', '')
      setData(BLANK_CV)
      setTheme(themeId)
      setTitle(lang === 'TR' ? 'Premium Önizleme' : 'Premium Preview')
      setSaved(true)
      return
    }

    cvApi.get(id).then(r => {
      setData({ ...BLANK_CV, ...r.data.data })
      setTheme(r.data.theme || 'minimal-midnight-serif')
      setTitle(r.data.title || 'CV')
      // Detect CV language from title: if title ends with (EN), (DE) etc. set cvLang accordingly
      const titleStr = r.data.title || ''
      if (/(\(EN\)|\(DE\)|\(FR\)|\(ES\))$/i.test(titleStr)) {
        setCvLang('EN')
      } else {
        setCvLang(lang)
      }
    }).catch(() => navigate('/dashboard'))
  }, [id, navigate]) // lang intentionally removed — CV content language is independent of UI language

  // saveNow ref'ten okur — stale closure yok
  const saveNow = useCallback(async () => {
    if (id?.startsWith('preview-')) return;
    setSaving(true)
    try {
      await cvApi.update(id, { title: titleRef.current, theme: themeRef.current, data: dataRef.current })
      setSaved(true)
    } catch (err) { console.error('Kaydetme hatası', err) }
    finally { setSaving(false) }
  }, [id])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!saved) {
        saveNow() // fire-and-forget save
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [saved, saveNow])

  const triggerSave = () => {
    setSaved(false)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(saveNow, 1500)
  }

  const upd = (field, value) => { setData(d => ({ ...d, [field]: value })); triggerSave() }
  const updNested = (field, index, key, value) => {
    setData(d => {
      const arr = [...(d[field] || [])]
      arr[index] = { ...arr[index], [key]: value }
      return { ...d, [field]: arr }
    }); triggerSave()
  }
  const addItem = (field, empty) => { setData(d => ({ ...d, [field]: [...(d[field] || []), empty] })); triggerSave() }
  const removeItem = (field, index) => { setData(d => ({ ...d, [field]: d[field].filter((_, i) => i !== index) })); triggerSave() }

  // title değişince hem state hem ref güncellenir
  const handleTitleChange = (val) => {
    setTitle(val)
    titleRef.current = val
    triggerSave()
  }

  // PDF — ücretsiz
  const handleDownloadPdf = async () => {
    if (id?.startsWith('preview-') || (getTemplateConfig(theme)?.premium && !user?.isPremium)) {
      navigate('/dashboard?upgrade=1')
      return
    }
    try {
      const el = document.getElementById('cv-print')
      if (!el) { alert('CV preview bulunamadı'); return }
      const css = `<style>
        @page{size:A4;margin:0;}
        html,body{width:210mm;margin:0!important;padding:0!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
        *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;box-sizing:border-box;}
        #cv-print{width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;border-radius:0!important;box-shadow:none!important;position:relative!important;transform:none!important;}
        #cv-print>div{width:100%!important;min-height:297mm!important;}
        h1, h2, h3, h4, h5, h6 { page-break-after: avoid; break-after: avoid; }
        #cv-print * { page-break-inside: avoid; break-inside: avoid; }
        #cv-print, #cv-print > div, #cv-print > div > div, #cv-print > div > div > div { page-break-inside: auto !important; break-inside: auto !important; }
      </style>`
      const html = `<!doctype html><html><head><meta charset="utf-8"/>${css}</head><body style="margin:0;padding:0;">${el.outerHTML}</body></html>`
      const res = await cvApi.exportPdfHtml(id, { title: titleRef.current, html })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = `${titleRef.current}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch (err) { console.error(err); alert('PDF oluşturulamadı') }
  }

  // AI — translate ücretsiz, diğerleri premium
  const handleAiAnalyze = async () => {
    if (!user?.isPremium) { alert(lang === 'TR' ? 'CV Analizi Premium özelliğidir.' : 'CV Analysis requires Premium.'); return }
    setAiLoading(true); setAiResult(null)
    try { const r = await aiApi.analyze(id, targetJob, cvLang); setAiResult({ type: 'analyze', ...r.data }) }
    catch { alert(lang === 'TR' ? 'AI analizi başarısız' : 'AI analysis failed') }
    finally { setAiLoading(false) }
  }

  const handleAiTranslate = async () => {
    setAiLoading(true); setAiResult(null)
    try {
      const r = await aiApi.translate(id, targetLang)
      setAiResult({ type: 'translate', ...r.data })
      // Set cvLang to target so the redirected CV shows correct dummy data
      setCvLang(targetLang === 'TR' ? 'TR' : 'EN')
      // Çeviri tamamlanınca yeni CV'ye yönlendir
      if (r.data.cvId) {
        setTimeout(() => navigate(`/editor/${r.data.cvId}`), 2000)
      }
    }
    catch { alert(lang === 'TR' ? 'Çeviri başarısız. Lütfen tekrar deneyin.' : 'Translation failed. Please try again.') }
    finally { setAiLoading(false) }
  }

  const handleCoverLetter = async () => {
    if (!user?.isPremium) { alert(lang === 'TR' ? 'Kapak mektubu Premium özelliğidir.' : 'Cover Letter requires Premium.'); return }
    setAiLoading(true); setAiResult(null)
    try { const r = await aiApi.coverLetter(id, coverRole, coverCompany, cvLang); setAiResult({ type: 'cover', text: r.data.text }) }
    catch { alert(lang === 'TR' ? 'Kapak mektubu oluşturulamadı' : 'Cover letter generation failed') }
    finally { setAiLoading(false) }
  }

  const handleJobMatch = async () => {
    if (!user?.isPremium) { alert(lang === 'TR' ? 'İş ilanı eşleştirme Premium özelliğidir.' : 'Job Matching requires Premium.'); return }
    setAiLoading(true); setAiResult(null)
    try { const r = await aiApi.jobMatch(id, jobUrl, cvLang); setAiResult({ type: 'job', ...r.data }) }
    catch { alert(lang === 'TR' ? 'İş ilanı analizi başarısız' : 'Job match analysis failed') }
    finally { setAiLoading(false) }
  }

  const score = cvScore(data)
  const isPreview = id?.startsWith('preview-')
  const isPremiumTheme = getTemplateConfig(theme)?.premium
  const isLocked = isPreview || (isPremiumTheme && !user?.isPremium)

  const scoreColor = score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#ef4444'
  const scoreBg = score > 70 ? '#f0fdf4' : score > 40 ? '#fffbeb' : '#fff5f5'

  const st = {
    page: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#f0f2f8', fontFamily: "'Inter',-apple-system,sans-serif", color: '#1e293b', overflow: 'hidden' },
    topBar: { height: '56px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '12px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
    titleInput: { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '8px', color: '#1e293b', fontSize: '13px', fontWeight: 600, outline: 'none', padding: '5px 10px', width: '160px', fontFamily: "'Inter',sans-serif", transition: 'border-color 0.2s' },
    saveStatus: { fontSize: '11px', color: saving ? '#f59e0b' : saved ? '#10b981' : '#94a3b8', flexShrink: 0, fontWeight: 600 },
    main: { display: 'flex', flex: 1, overflow: 'hidden' },
    sidebar: { width: panelCollapsed ? '40px' : `${panelWidth}px`, flexShrink: 0, background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 0.18s ease', position: 'relative' },
    steps: { display: 'flex', gap: '4px', padding: '8px', flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9', flexShrink: 0, background: '#fafbfc' },
    stepBtn: (a) => ({ padding: '5px 9px', borderRadius: '7px', border: 'none', fontSize: '11px', fontWeight: a ? 700 : 500, background: a ? '#2563eb' : '#f1f5f9', color: a ? 'white' : '#64748b', cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.15s' }),
    formWrap: { flex: 1, overflowY: 'auto', padding: '14px' },
    lbl: { display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '5px', fontWeight: 600, letterSpacing: '0.2px' },
    inp: { width: '100%', padding: '8px 11px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '10px', fontFamily: "'Inter',sans-serif", transition: 'border-color 0.2s' },
    ta: { width: '100%', padding: '8px 11px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', marginBottom: '10px', minHeight: '72px', fontFamily: "'Inter',sans-serif" },
    addBtn: { padding: '8px 14px', borderRadius: '8px', border: '1.5px dashed #bfdbfe', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', fontSize: '12px', fontWeight: 600, width: '100%', marginBottom: '10px', fontFamily: "'Inter',sans-serif" },
    itemCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', marginBottom: '8px', position: 'relative' },
    rmBtn: { position: 'absolute', top: '7px', right: '7px', background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: '6px', padding: '2px 7px', cursor: 'pointer', fontSize: '11px', fontFamily: "'Inter',sans-serif" },
    preview: { flex: 1, background: '#e8ecf4', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    previewScroll: { flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '24px', alignItems: 'flex-start' },
    cvSheet: { width: '210mm', minHeight: '297mm', background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 },
    aiWrap: { background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '12px 16px', flexShrink: 0 },
    aiTab: (a) => ({ padding: '5px 12px', borderRadius: '20px', border: '1.5px solid', fontSize: '11px', cursor: 'pointer', background: a ? '#2563eb' : 'white', borderColor: a ? '#2563eb' : '#e2e8f0', color: a ? 'white' : '#64748b', fontWeight: a ? 700 : 500, fontFamily: "'Inter',sans-serif", transition: 'all 0.15s' }),
    scoreBar: (s) => ({ height: '6px', borderRadius: '3px', background: `linear-gradient(90deg, ${s > 70 ? '#10b981' : s > 40 ? '#f59e0b' : '#ef4444'} ${s}%, #e2e8f0 ${s}%)` }),
    btn: (v) => ({ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', background: v === 'primary' ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : '#f1f5f9', color: v === 'primary' ? 'white' : '#475569', fontFamily: "'Inter',sans-serif" }),
  }

  return (
    <div style={st.page}>
      {/* Top Bar */}
      <div style={st.topBar}>
        <div style={{ fontWeight: 900, fontSize: '17px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={async () => { await saveNow(); navigate('/dashboard') }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#4f46e5,#2563eb)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 900 }}>CV</div>
          <span style={{ color: '#1e293b' }}>CV<span style={{ color: '#2563eb' }}>Craft</span></span>
        </div>
        <input style={st.titleInput} value={title} onChange={e => handleTitleChange(e.target.value)} />
        <button onClick={saveNow} style={{ padding: '6px 12px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
          {lang === 'TR' ? 'Kaydet' : 'Save'}
        </button>
        <span style={st.saveStatus}>{saving ? t.saving : saved ? t.saved : t.unsaved}</span>
        <div style={{ flex: 1 }} />
        <button onClick={toggleLang} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '7px', color: '#475569', cursor: 'pointer', fontSize: '12px', fontWeight: 700, padding: '5px 12px', fontFamily: "'Inter',sans-serif" }}>
          {lang === 'TR' ? '🇹🇷 TR' : '🇬🇧 EN'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: scoreBg, border: `1px solid ${scoreColor}30`, borderRadius: '8px', padding: '5px 12px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{t.cvScore}</span>
          <div style={{ width: '60px', ...st.scoreBar(score) }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: scoreColor }}>{score}%</span>
        </div>
        <button onClick={handleDownloadPdf} style={{ ...st.btn('primary'), display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>⬇ {t.downloadPdf}</button>
        <button onClick={async () => { await saveNow(); navigate('/templates') }} style={{ ...st.btn(), fontSize: '11px' }}>{t.templates}</button>
      </div>

      <div style={st.main}>
        {/* Sol — Form */}
        <div style={{ ...st.sidebar, position: 'relative' }}>
          {isLocked && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(255,255,255,0.73)', backdropFilter: 'blur(3px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '42px', marginBottom: '12px' }}>🔒</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                {lang === 'TR' ? 'Premium Şablon' : 'Premium Template'}
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px', lineHeight: 1.5 }}>
                {lang === 'TR' ? 'Bu şablonu tam boyutta inceleyebilirsiniz ancak kendi bilgilerinizi girmek ve PDF indirmek için Premium gereklidir.' : 'You can preview this template, but upgrading to Premium is required to edit and download it.'}
              </p>
              <button
                onClick={() => navigate('/dashboard?upgrade=1')}
                style={{ ...st.btn('primary'), padding: '12px 24px', fontSize: '14px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
              >
                ✨ {lang === 'TR' ? 'Premium\'a Geç' : 'Upgrade to Premium'}
              </button>
            </div>
          )}
          {/* Collapse toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: panelCollapsed ? 'center' : 'flex-end', padding: '4px 8px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
            <button
              onClick={() => setPanelCollapsed(c => !c)}
              title={panelCollapsed ? (lang === 'TR' ? 'Genişlet' : 'Expand') : (lang === 'TR' ? 'Daralt' : 'Collapse')}
              style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 700, lineHeight: 1 }}
            >{panelCollapsed ? '›' : '‹'}</button>
          </div>
          <div style={st.steps}>
            {!panelCollapsed && t.steps.map((s, i) => (
              <button key={i} style={st.stepBtn(step === i && !atsOpen)} onClick={() => { setStep(i); setAtsOpen(false) }}>{s}</button>
            ))}
            {!panelCollapsed && (
              <button style={st.stepBtn(atsOpen)} onClick={() => { setAtsOpen(o => !o) }} title="ATS Score">🎯 ATS</button>
            )}
          </div>
          <div style={{ ...st.formWrap, display: panelCollapsed ? 'none' : 'block' }}>
            {atsOpen && (() => {
              const r = parseAtsFromDom(lang)
              if (r?.error) return <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>{r.msg}</div>
              return (
                <div>
                  {/* Header */}
                  <div style={{ textAlign: 'center', padding: '14px 0 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '12px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: r.gradeColor + '18', border: `3px solid ${r.gradeColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <span style={{ fontSize: '18px', fontWeight: 900, color: r.gradeColor, lineHeight: 1 }}>{r.grade}</span>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '26px', fontWeight: 900, color: r.gradeColor, lineHeight: 1 }}>{r.pct}%</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{lang === 'TR' ? 'ATS Uyum Skoru' : 'ATS Parse Score'}</div>
                      </div>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden', marginTop: '10px' }}>
                      <div style={{ height: '100%', width: `${r.pct}%`, borderRadius: '3px', background: r.gradeColor, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '5px', textAlign: 'right' }}>{r.total}/{r.maxTotal} pt</div>
                  </div>
                  {/* Info strip */}
                  <div style={{ fontSize: '10px', color: '#64748b', background: '#f8fafc', borderRadius: '7px', padding: '7px 10px', marginBottom: '12px', lineHeight: 1.6 }}>
                    🤖 {lang === 'TR'
                      ? 'Bu analiz render edilmiş CV\'nin ham metnini tarayarak yapılır — form verisi değil, ATS\'nin gördüğü.'
                      : 'This analysis scans the rendered CV\'s plain text — not form data, but what the ATS actually sees.'}
                  </div>
                  {/* Checks */}
                  {r.checks.map(c => (
                    <div key={c.id} style={{ marginBottom: '8px', padding: '9px 11px', borderRadius: '9px', border: '1px solid', background: c.ok ? '#f0fdf4' : (c.score > 0 ? '#fffbeb' : '#fef2f2'), borderColor: c.ok ? '#bbf7d0' : (c.score > 0 ? '#fde68a' : '#fecaca') }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                        <span style={{ fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>{c.ok ? '✅' : c.score > 0 ? '⚠️' : '❌'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: c.ok ? '#166534' : '#92400e' }}>{c.label}</div>
                          {c.detail && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>{c.detail}</div>}
                          {!c.ok && c.tip && <p style={{ fontSize: '10px', color: '#78350f', lineHeight: 1.5, margin: '4px 0 0' }}>{c.tip}</p>}
                          {/* Section sub-badges */}
                          {c.sub && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '5px' }}>
                              {c.sub.map(({ k, found }) => (
                                <span key={k} style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: found ? '#dcfce7' : '#fee2e2', color: found ? '#15803d' : '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                  {found ? '✓' : '✕'} {k}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>{c.score}/{c.max}</span>
                      </div>
                    </div>
                  ))}
                  {/* Extracted text preview */}
                  <div style={{ marginTop: '10px', padding: '8px 10px', background: '#0f172a', borderRadius: '8px' }}>
                    <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
                      {lang === 'TR' ? '📄 ATS\'nin Gördüğü Ham Metin (ilk 300 kr)' : '📄 Raw Text ATS Sees (first 300 ch)'}
                    </div>
                    <pre style={{ fontSize: '9px', color: '#94a3b8', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '80px', overflow: 'hidden', fontFamily: 'monospace', lineHeight: 1.5 }}>
                      {r.rawText?.slice(0, 300)}...
                    </pre>
                  </div>
                </div>
              )
            })()}
            {!atsOpen && <>

            {/* Kişisel */}
            {step === 0 && (<>
                <label style={st.lbl}>{t.fullName}</label>
                <input style={st.inp} value={data.name} onChange={e => upd('name', e.target.value)} placeholder={t.namePlaceholder} />
                <label style={st.lbl}>{t.jobTitle}</label>
                <input style={st.inp} value={data.title} onChange={e => upd('title', e.target.value)} placeholder={t.titlePlaceholder} />
                <label style={st.lbl}>{t.email}</label>
                <input style={st.inp} value={data.email} onChange={e => upd('email', e.target.value)} placeholder={t.emailPlaceholder} />
                <label style={st.lbl}>{t.phone}</label>
                <input style={st.inp} value={data.phone} onChange={e => upd('phone', e.target.value)} placeholder={t.phonePlaceholder} />
                <label style={st.lbl}>{t.city}</label>
                <input style={st.inp} value={data.location} onChange={e => upd('location', e.target.value)} placeholder={t.cityPlaceholder} />
                <label style={st.lbl}>{t.linkedin}</label>
                <input style={st.inp} value={data.linkedin} onChange={e => upd('linkedin', e.target.value)} placeholder={t.linkedinPlaceholder} />
                <label style={st.lbl}>{t.summary}</label>
                <textarea style={st.ta} value={data.summary} onChange={e => upd('summary', e.target.value)} placeholder={t.summaryPlaceholder} rows={5} />
              </>)}

            {/* Deneyim */}
            {step === 1 && (<>
              {(data.experience || []).map((exp, i) => (
                <div key={i} style={st.itemCard}>
                  <button style={st.rmBtn} onClick={() => removeItem('experience', i)}>✕</button>
                  <input style={st.inp} placeholder={t.rolePlaceholder} value={exp.role || ''} onChange={e => updNested('experience', i, 'role', e.target.value)} />
                  <input style={st.inp} placeholder={t.companyPlaceholder} value={exp.company || ''} onChange={e => updNested('experience', i, 'company', e.target.value)} />
                  <input style={st.inp} placeholder={t.periodPlaceholder} value={exp.period || ''} onChange={e => updNested('experience', i, 'period', e.target.value)} />
                  <textarea style={st.ta} placeholder={t.descPlaceholder} value={exp.desc || ''} onChange={e => updNested('experience', i, 'desc', e.target.value)} rows={3} />
                </div>
              ))}
              <button style={st.addBtn} onClick={() => addItem('experience', { role: '', company: '', period: '', desc: '' })}>{t.addExperience}</button>
            </>)}

            {/* Eğitim */}
            {step === 2 && (<>
              {(data.education || []).map((edu, i) => (
                <div key={i} style={st.itemCard}>
                  <button style={st.rmBtn} onClick={() => removeItem('education', i)}>✕</button>
                  <input style={st.inp} placeholder={t.schoolPlaceholder} value={edu.school || ''} onChange={e => updNested('education', i, 'school', e.target.value)} />
                  <input style={st.inp} placeholder={t.degreePlaceholder} value={edu.degree || ''} onChange={e => updNested('education', i, 'degree', e.target.value)} />
                  <input style={st.inp} placeholder={t.eduPeriodPlaceholder} value={edu.period || ''} onChange={e => updNested('education', i, 'period', e.target.value)} />
                </div>
              ))}
              <button style={st.addBtn} onClick={() => addItem('education', { school: '', degree: '', period: '' })}>{t.addEducation}</button>
            </>)}

            {/* Beceriler */}
            {step === 3 && (<>
              <label style={st.lbl}>{t.skillsLabel}</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input style={{ ...st.inp, marginBottom: 0, flex: 1 }} placeholder={t.skillPlaceholder} value={newSkill} onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newSkill.trim()) { upd('skills', [...(data.skills || []), newSkill.trim()]); setNewSkill('') } }} />
                <button style={st.btn('primary')} onClick={() => { if (newSkill.trim()) { upd('skills', [...(data.skills || []), newSkill.trim()]); setNewSkill('') } }}>+</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                {(data.skills || []).map((s, i) => (
                  <span key={i} style={{ background: 'rgba(124,92,191,0.2)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {s}<span onClick={() => removeItem('skills', i)} style={{ cursor: 'pointer', color: '#fca5a5', fontWeight: 700 }}>✕</span>
                  </span>
                ))}
              </div>
              <label style={st.lbl}>{t.languagesLabel}</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input style={{ ...st.inp, marginBottom: 0, flex: 1 }} placeholder={t.langPlaceholder} value={newLang} onChange={e => setNewLang(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newLang.trim()) { upd('languages', [...(data.languages || []), newLang.trim()]); setNewLang('') } }} />
                <button style={st.btn('primary')} onClick={() => { if (newLang.trim()) { upd('languages', [...(data.languages || []), newLang.trim()]); setNewLang('') } }}>+</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(data.languages || []).filter(l => l).map((l, i) => (
                  <span key={i} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {l}<span onClick={() => removeItem('languages', i)} style={{ cursor: 'pointer', color: '#fca5a5', fontWeight: 700 }}>✕</span>
                  </span>
                ))}
              </div>
            </>)}

            {/* Projeler */}
            {step === 4 && (<>
              {(data.projects || []).map((proj, i) => (
                <div key={i} style={st.itemCard}>
                  <button style={st.rmBtn} onClick={() => removeItem('projects', i)}>✕</button>
                  <input style={st.inp} placeholder={t.projectName} value={proj.name || ''} onChange={e => updNested('projects', i, 'name', e.target.value)} />
                  <input style={st.inp} placeholder={t.projectLink} value={proj.link || ''} onChange={e => updNested('projects', i, 'link', e.target.value)} />
                  <textarea style={st.ta} placeholder={t.projectDesc} value={proj.desc || ''} onChange={e => updNested('projects', i, 'desc', e.target.value)} rows={3} />
                </div>
              ))}
              <button style={st.addBtn} onClick={() => addItem('projects', { name: '', link: '', desc: '' })}>{t.addProject}</button>
            </>)}

            {/* Sertifikalar */}
            {step === 5 && (<>
              {(data.certificates || []).map((cert, i) => (
                <div key={i} style={st.itemCard}>
                  <button style={st.rmBtn} onClick={() => removeItem('certificates', i)}>✕</button>
                  <input style={st.inp} placeholder={t.certNamePlaceholder} value={cert.name || ''} onChange={e => updNested('certificates', i, 'name', e.target.value)} />
                  <input style={st.inp} placeholder={t.certIssuerPlaceholder} value={cert.issuer || ''} onChange={e => updNested('certificates', i, 'issuer', e.target.value)} />
                  <input style={st.inp} placeholder={t.certDatePlaceholder} value={cert.date || ''} onChange={e => updNested('certificates', i, 'date', e.target.value)} />
                </div>
              ))}
              <button style={st.addBtn} onClick={() => addItem('certificates', { name: '', issuer: '', date: '' })}>{t.addCertificate}</button>
            </>)}

            {/* Tema */}
            {step === 6 && (<>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>{t.selected}: <strong style={{ color: '#a78bfa' }}>{getTemplateConfig(theme)?.name}</strong></p>
              <button onClick={() => navigate('/templates')} style={{ ...st.btn('primary'), width: '100%', marginBottom: '16px', padding: '10px' }}>
                {t.openGallery} ({TEMPLATES_CATALOG.length})
              </button>
              <label style={st.lbl}>{t.colorPalette}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                {Object.entries(PALETTES).map(([key, pal]) => {
                  const cfg = getTemplateConfig(theme)
                  return <div key={key} title={pal.name} onClick={() => { const nid = `${cfg.layout}-${key}-${cfg.font}`; setTheme(nid); themeRef.current = nid; triggerSave() }}
                    style={{ width: '26px', height: '26px', borderRadius: '50%', background: pal.accent, cursor: 'pointer', border: cfg.palette === key ? '3px solid white' : '2px solid transparent', boxSizing: 'border-box', flexShrink: 0 }} />
                })}
              </div>
              <label style={st.lbl}>{t.font}</label>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {Object.entries(FONTS).map(([key, font]) => {
                  const cfg = getTemplateConfig(theme)
                  return <button key={key} style={{ ...st.stepBtn(cfg.font === key), fontFamily: font.family }} onClick={() => { const nid = `${cfg.layout}-${cfg.palette}-${key}`; setTheme(nid); themeRef.current = nid; triggerSave() }}>{font.name}</button>
                })}
              </div>
              <button onClick={handleDownloadPdf} style={{ ...st.btn('primary'), width: '100%', padding: '11px' }}>{t.downloadPdfBtn}</button>
            </>)}
            </>}
          </div>
        </div>

        {/* Drag Handle */}
        <div
          onMouseDown={(e) => { if (!panelCollapsed) { isDragging.current = true; dragStartX.current = e.clientX; dragStartWidth.current = panelWidth; e.preventDefault() } }}
          style={{ width: '5px', flexShrink: 0, cursor: panelCollapsed ? 'default' : 'col-resize', background: 'transparent', transition: 'background 0.15s', position: 'relative', zIndex: 5 }}
          onMouseEnter={e => { if (!panelCollapsed) e.currentTarget.style.background = '#c7d2fe' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        />

        {/* Sağ — Önizleme + AI */}
        <div style={st.preview}>
          {/* AI Paneli — önizlemenin üstünde */}
          <div style={st.aiWrap}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#64748b', marginRight: '4px', fontWeight: 600 }}>{t.aiLabel}</span>
              {[
                { key: 'analyze', label: t.aiAnalyze + (user?.isPremium ? '' : ' 🔒') },
                { key: 'translate', label: t.aiTranslate + ' ✓' },
                { key: 'cover', label: t.aiCover + (user?.isPremium ? '' : ' 🔒') },
                { key: 'job', label: t.aiJob + (user?.isPremium ? '' : ' 🔒') },
              ].map(({ key, label }) => (
                <button key={key} style={st.aiTab(aiPanel === key)} onClick={() => setAiPanel(aiPanel === key ? null : key)}>{label}</button>
              ))}
            </div>

            {aiPanel === 'analyze' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input style={{ ...st.inp, marginBottom: 0, flex: 1, maxWidth: '280px' }} placeholder={t.targetJobPlaceholder} value={targetJob} onChange={e => setTargetJob(e.target.value)} />
                <button style={st.btn('primary')} onClick={handleAiAnalyze} disabled={aiLoading}>{aiLoading ? t.analyzing : t.analyzeBtn}</button>
              </div>
            )}
            {aiPanel === 'translate' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select style={{ ...st.inp, marginBottom: 0, width: 'auto' }} value={targetLang} onChange={e => setTargetLang(e.target.value)}>
                  <option value="EN">🇬🇧 {lang === 'TR' ? 'İngilizce' : 'English'}</option>
                  <option value="DE">🇩🇪 {lang === 'TR' ? 'Almanca' : 'German'}</option>
                  <option value="FR">🇫🇷 {lang === 'TR' ? 'Fransızca' : 'French'}</option>
                  <option value="ES">🇪🇸 {lang === 'TR' ? 'İspanyolca' : 'Spanish'}</option>
                </select>
                <button style={st.btn('primary')} onClick={handleAiTranslate} disabled={aiLoading}>{aiLoading ? t.translating : t.translateBtn}</button>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{t.translateNote}</span>
              </div>
            )}
            {aiPanel === 'cover' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input style={{ ...st.inp, marginBottom: 0, flex: 1, maxWidth: '180px' }} placeholder={t.coverRolePlaceholder} value={coverRole} onChange={e => setCoverRole(e.target.value)} />
                <input style={{ ...st.inp, marginBottom: 0, flex: 1, maxWidth: '180px' }} placeholder={t.coverCompanyPlaceholder} value={coverCompany} onChange={e => setCoverCompany(e.target.value)} />
                <button style={st.btn('primary')} onClick={handleCoverLetter} disabled={aiLoading}>{aiLoading ? t.coverGenerating : t.coverBtn}</button>
              </div>
            )}
            {aiPanel === 'job' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input style={{ ...st.inp, marginBottom: 0, flex: 1 }} placeholder={t.jobPlaceholder} value={jobUrl} onChange={e => setJobUrl(e.target.value)} />
                <button style={st.btn('primary')} onClick={handleJobMatch} disabled={aiLoading}>{aiLoading ? t.jobAnalyzing : t.jobBtn}</button>
              </div>
            )}

            {aiResult && (
              <div style={{ marginTop: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', maxHeight: '180px', overflowY: 'auto' }}>
                {aiResult.type === 'analyze' && (<>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '22px', fontWeight: 700, color: '#10b981' }}>{aiResult.score}</div><div style={{ fontSize: '10px', color: '#94a3b8' }}>{t.generalScore}</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '22px', fontWeight: 700, color: '#4f46e5' }}>{aiResult.afterScore}</div><div style={{ fontSize: '10px', color: '#94a3b8' }}>{t.afterScore}</div></div>
                    <div style={{ flex: 1 }}><p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.6 }}>{aiResult.summary}</p></div>
                  </div>
                  {aiResult.improvements?.map((imp, i) => <p key={i} style={{ fontSize: '11px', color: '#475569', marginBottom: '3px' }}>• {imp}</p>)}
                </>)}
                {aiResult.type === 'translate' && (
                  <div>
                    <p style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>{t.translateSuccess}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                      {lang === 'TR' ? 'Yeni CV\'ye yönlendiriliyorsunuz...' : 'Redirecting to new CV...'}
                    </p>
                  </div>
                )}                {aiResult.type === 'cover' && (<>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#4f46e5' }}>{t.coverTitle}</span>
                    <button onClick={() => navigator.clipboard.writeText(aiResult.text)} style={{ padding: '1px 8px', background: '#eff6ff', border: '1px solid #c7d2fe', color: '#4f46e5', borderRadius: '5px', cursor: 'pointer', fontSize: '10px', fontWeight: 600 }}>{t.copyBtn}</button>
                  </div>
                  <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiResult.text}</p>
                </>)}
                {aiResult.type === 'job' && (<>
                  <div style={{ display: 'flex', gap: '14px', marginBottom: '8px' }}>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{aiResult.matchScore}%</div><div style={{ fontSize: '10px', color: '#94a3b8' }}>{t.matchScore}</div></div>
                    <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.6, flex: 1 }}>{aiResult.summary}</p>
                  </div>
                  {aiResult.suggestions?.map((s, i) => <p key={i} style={{ fontSize: '11px', color: '#f59e0b', marginBottom: '3px', fontWeight: 500 }}>⚡ {s}</p>)}
                </>)}
              </div>
            )}
          </div>

          {/* CV Önizleme */}
          <div style={st.previewScroll}>
            <div id="cv-print" style={st.cvSheet}>
              <CVTemplate templateId={theme} data={{
                name: data.name || (cvLang === 'TR' ? DUMMY_DATA.name : 'John Doe'),
                title: data.title || (cvLang === 'TR' ? DUMMY_DATA.title : 'Senior Software Engineer'),
                email: data.email || (cvLang === 'TR' ? DUMMY_DATA.email : 'john.doe@email.com'),
                phone: data.phone || (cvLang === 'TR' ? DUMMY_DATA.phone : '+1 234 567 8900'),
                location: data.location || (cvLang === 'TR' ? DUMMY_DATA.location : 'New York, USA'),
                linkedin: data.linkedin || (cvLang === 'TR' ? DUMMY_DATA.linkedin : 'linkedin.com/in/johndoe'),
                summary: data.summary || (cvLang === 'TR' ? DUMMY_DATA.summary : 'Experienced software engineer focused on developing innovative technologies. Deeply experienced in Agile methodologies, microservices architectures and highly scalable systems.'),
                experience: data.experience?.length > 0 ? data.experience : DUMMY_DATA.experience,
                education: data.education?.length > 0 ? data.education : DUMMY_DATA.education,
                skills: data.skills?.length > 0 ? data.skills : DUMMY_DATA.skills,
                languages: data.languages?.length > 0 ? data.languages : DUMMY_DATA.languages,
                projects: data.projects?.length > 0 ? data.projects : DUMMY_DATA.projects,
                certificates: data.certificates?.length > 0 ? data.certificates : DUMMY_DATA.certificates,
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
