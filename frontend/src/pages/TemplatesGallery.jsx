import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cvApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useLangStore } from '../store/langStore'
import { translations as galleryTranslations } from '../i18n/translations'
import { TEMPLATES_CATALOG, CVTemplate } from '../components/cv/CVTemplates'

function LangToggle() {
  const { lang, toggleLang } = useLangStore()
  return (
    <button onClick={toggleLang} style={{ background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',color:'white',cursor:'pointer',fontSize:'13px',fontWeight:700,padding:'6px 14px' }}>
      {lang === 'TR' ? '🇹🇷 TR' : '🇬🇧 EN'}
    </button>
  )
}

const SAMPLE = {
  name:'Alex Johnson',title:'Software Engineer',email:'alex@email.com',phone:'+1 555 123 4567',location:'New York',linkedin:'linkedin.com/in/alex',
  summary:'Experienced developer with expertise in React and Java, building scalable enterprise applications.',
  experience:[{role:'Senior Developer',company:'Tech Corp',period:'2022 - Present',desc:'Built enterprise apps with React and Spring Boot.'},{role:'Developer',company:'Startup Inc',period:'2020-2022',desc:'Frontend development and API integrations.'}],
  education:[{school:'MIT',degree:'Computer Science',period:'2016-2020'}],
  skills:['React','Java','Spring Boot','PostgreSQL','Docker'],
  languages:['English (Native)','Spanish (B2)'],
  projects:[{name:'CVCraft',link:'github.com/alex/cvcraft',desc:'ATS-optimized CV builder SaaS.'}],
  certificates:[{name:'AWS Certified Developer',issuer:'Amazon',date:'2023'}],
}

export function TemplatesGallery() {
  const [search, setSearch] = useState('')
  const [hoveredId, setHoveredId] = useState(null)
  const [creating, setCreating] = useState(null)
  const { user } = useAuthStore()
  const { lang } = useLangStore()
  const t = galleryTranslations[lang]
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeFilter, setActiveFilter] = useState(searchParams.get('cat') || 'Tümü')

  const cats = lang === 'TR'
    ? ['Tümü', 'Genel', 'Yazılım', 'Kurumsal', 'Kreatif', 'Akademik', 'Sağlık', 'Hukuk']
    : ['All', 'General', 'Software', 'Corporate', 'Creative', 'Academic', 'Healthcare', 'Legal']
  const catMap = {'All':'Tümü','General':'Genel','Software':'Yazılım','Corporate':'Kurumsal','Creative':'Kreatif','Academic':'Akademik','Healthcare':'Sağlık','Legal':'Hukuk'}

  const filtered = TEMPLATES_CATALOG.filter(tmpl => {
    const activeCat = lang === 'EN' ? (catMap[activeFilter] || activeFilter) : activeFilter
    const matchCat = activeCat === 'Tümü' || tmpl.category === activeCat
    const matchSearch = tmpl.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const freeCount = filtered.filter(t => !t.premium).length
  const premiumCount = filtered.filter(t => t.premium).length

  const handleSelect = async (template) => {
    if (template.premium && !user?.isPremium) { 
      navigate(`/editor/preview-${template.id}`); 
      return; 
    }
    setCreating(template.id)
    try {
      const { data } = await cvApi.create({
        title: lang==='TR'?'Yeni CV':'New CV',
        theme: template.id,
        data: { name:user?.name||'',title:'',email:user?.email||'',phone:'',location:'',linkedin:'',summary:'',experience:[],education:[],skills:[],languages:[],projects:[],certificates:[] }
      })
      navigate(`/editor/${data.id}`)
    } catch (err) {
      if (err.response?.status === 402) navigate('/dashboard?upgrade=1')
      else alert('Error')
    } finally { setCreating(null) }
  }

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',fontFamily:"'Segoe UI', sans-serif",color:'white' }}>
      <header style={{ padding:'16px 36px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'16px',borderBottom:'1px solid rgba(255,255,255,0.08)',background:'rgba(0,0,0,0.2)',position:'sticky',top:0,zIndex:100 }}>
        <div style={{ fontWeight:800,fontSize:'22px',cursor:'pointer',flexShrink:0 }} onClick={() => navigate('/dashboard')}><span style={{ color:'#a78bfa' }}>CV</span>Craft</div>
        <input style={{ flex:1,maxWidth:'400px',padding:'9px 16px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.07)',color:'white',fontSize:'14px',outline:'none' }}
          placeholder={t.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display:'flex',gap:'10px',alignItems:'center',flexShrink:0 }}>
          <LangToggle />
          <button onClick={() => navigate('/dashboard')} style={{ padding:'8px 16px',borderRadius:'9px',border:'1px solid rgba(255,255,255,0.2)',background:'transparent',color:'white',cursor:'pointer',fontSize:'12px' }}>{t.backToDashboard}</button>
        </div>
      </header>

      <div style={{ padding:'28px 36px',maxWidth:'1400px',margin:'0 auto' }}>
        <div style={{ marginBottom:'24px' }}>
          <h1 style={{ fontSize:'26px',fontWeight:700,marginBottom:'4px' }}>{t.title}</h1>
          <p style={{ color:'rgba(255,255,255,0.5)',fontSize:'14px' }}>
            {TEMPLATES_CATALOG.length} {t.subtitle} · 
            <span style={{ color:'#4ade80',fontWeight:600 }}> {TEMPLATES_CATALOG.filter(t=>!t.premium).length} {lang==='TR'?'ücretsiz':'free'}</span> · 
            <span style={{ color:'#a78bfa',fontWeight:600 }}> {TEMPLATES_CATALOG.filter(t=>t.premium).length} {lang==='TR'?'premium':'premium'}</span>
          </p>
        </div>

        {/* Kategoriler */}
        <div style={{ display:'flex',gap:'7px',flexWrap:'wrap',marginBottom:'24px' }}>
          {cats.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              style={{ padding:'6px 16px',borderRadius:'20px',border:activeFilter===cat?'none':'1px solid rgba(255,255,255,0.12)',background:activeFilter===cat?'linear-gradient(135deg,#7c5cbf,#a78bfa)':'rgba(255,255,255,0.05)',color:'white',cursor:'pointer',fontSize:'13px',fontWeight:activeFilter===cat?700:400 }}>
              {cat}
            </button>
          ))}
        </div>

        <p style={{ color:'rgba(255,255,255,0.35)',fontSize:'12px',marginBottom:'18px' }}>
          {filtered.length} {t.showing} · <span style={{ color:'#4ade80' }}>{freeCount} {lang==='TR'?'ücretsiz':'free'}</span> · <span style={{ color:'#a78bfa' }}>{premiumCount} premium</span>
        </p>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:'20px' }}>
          {filtered.map(template => (
            <div key={template.id}
              style={{ background:'rgba(255,255,255,0.04)',border:`2px solid ${hoveredId===template.id?'#a78bfa':'rgba(255,255,255,0.08)'}`,borderRadius:'14px',overflow:'hidden',cursor:'pointer',transition:'all 0.22s',transform:hoveredId===template.id?'translateY(-5px)':'none',boxShadow:hoveredId===template.id?'0 16px 36px rgba(167,139,250,0.2)':'none' }}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleSelect(template)}>
              {/* Canlı önizleme */}
              <div style={{ height:'290px',overflow:'hidden',background:'white',position:'relative' }}>
                {template.premium && !user?.isPremium && (
                  <div style={{ position:'absolute',top:'12px',right:'12px',zIndex:10,background:'rgba(0,0,0,0.7)',padding:'5px 12px',borderRadius:'20px',display:'flex',alignItems:'center',gap:'6px',backdropFilter:'blur(4px)' }}>
                    <span style={{ fontSize:'12px' }}>🔒</span>
                    <span style={{ color:'white',fontWeight:700,fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.5px' }}>Premium</span>
                  </div>
                )}
                <div style={{ transform:'scale(0.355)',transformOrigin:'top left',width:'591px',pointerEvents:'none' }}>
                  <CVTemplate templateId={template.id} data={SAMPLE} />
                </div>
              </div>
              {/* Kart altı */}
              <div style={{ padding:'11px 14px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <div>
                  <p style={{ fontWeight:600,fontSize:'12px',margin:0 }}>{template.name}</p>
                  <p style={{ fontSize:'10px',color:'rgba(255,255,255,0.4)',margin:'2px 0 0' }}>{template.category}</p>
                </div>
                <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px' }}>
                  <span style={{ fontSize:'10px',fontWeight:700,padding:'3px 9px',borderRadius:'9px',background:template.premium?'linear-gradient(135deg,#7c5cbf,#a78bfa)':'rgba(34,197,94,0.2)',color:template.premium?'white':'#4ade80' }}>
                    {template.premium ? t.premium : t.free}
                  </span>
                  {creating === template.id && <span style={{ fontSize:'10px',color:'#a78bfa' }}>{t.creating}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center',padding:'60px',color:'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize:'40px',marginBottom:'12px' }}>🔍</div>
            <p>{t.noResults}</p>
          </div>
        )}
      </div>
    </div>
  )
}
