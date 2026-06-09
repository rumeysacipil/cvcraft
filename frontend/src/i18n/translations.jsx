export const LANG_KEY = 'cvcraft_lang'

export function getLang() {
  return localStorage.getItem(LANG_KEY) || 'TR'
}

export function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang)
}

// Tüm sayfalarda kullanılan dil toggle bileşeni
export function LangToggle({ lang, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 700,
        padding: '6px 14px',
        letterSpacing: '0.5px',
        flexShrink: 0,
      }}
    >
      {lang === 'TR' ? '🇹🇷 TR' : '🇬🇧 EN'}
    </button>
  )
}

export const translations = {
  TR: {
    // Auth
    login: 'Giriş Yap',
    register: 'Hesap Oluştur',
    email: 'E-posta',
    password: 'Şifre',
    passwordHint: 'Şifre (min. 8 karakter)',
    fullName: 'Ad Soyad',
    loginBtn: 'Giriş Yap',
    loginLoading: 'Giriş yapılıyor...',
    registerBtn: 'Ücretsiz Başla',
    registerLoading: 'Kaydediliyor...',
    noAccount: 'Hesabın yok mu?',
    hasAccount: 'Zaten hesabın var mı?',
    registerLink: 'Kayıt ol',
    loginLink: 'Giriş yap',
    loginError: 'Giriş başarısız',
    registerError: 'Kayıt başarısız',
    passwordShort: 'Şifre en az 8 karakter olmalı',

    // Dashboard
    hello: 'Merhaba',
    logout: 'Çıkış',
    premium: '✓ Premium',
    myCvs: 'CV\'lerim',
    newCv: '+ Yeni CV Oluştur',
    templateGallery: '🎨 Şablon Galerisi',
    premiumBannerTitle: '✨ Premium\'a Geç',
    premiumBannerDesc: 'Sınırsız CV, 60+ şablon, PDF export, AI analizi, dil çevirisi, kapak mektubu',
    oneTimePdf: '₺29 — Tek PDF',
    subscribe: '₺149/ay — Premium',
    loading: 'Yükleniyor...',
    noCvTitle: 'Henüz CV\'in yok',
    noCvDesc: 'Bir şablon seçerek başla',
    chooseTemplate: '🎨 Şablon Seç',
    theme: 'Tema',
    copy: '⧉',
    delete: '✕',
    copyingCv: '⟳',
    updatedAt: (date) => new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),

    galleryTitle: 'Şablon Seç',
    galleryDesc: (count) => `${count} profesyonel şablon · Şablona tıkla, hemen düzenlemeye başla`,
    searchPlaceholder: '🔍  Şablon ara...',
    backToDashboard: '← Ana Ekran',
    showing: (count) => `${count} şablon gösteriliyor`,
    freeBadge: '✓ Ücretsiz',
    premiumBadge: '★ Premium',
    creating: 'Oluşturuluyor...',
    categories: ['Tümü', 'Genel', 'Yazılım', 'Kurumsal', 'Kreatif', 'Akademik', 'Sağlık', 'Hukuk'],
    noResults: 'Arama sonucu bulunamadı',

    // Editor - Top bar
    saving: '⟳ Kaydediliyor...',
    saved: '✓ Kaydedildi',
    unsaved: '● Kaydedilmedi',
    cvScore: 'CV Skoru',
    downloadPdf: '⬇ PDF İndir',
    templates: '🎨 Şablonlar',

    // Editor - Steps
    steps: ['Kişisel', 'Deneyim', 'Eğitim', 'Beceriler', 'Projeler', 'Sertifikalar', 'Tema & Dışa Aktar'],

    // Editor - Step 0
    jobTitle: 'Unvan / Pozisyon',
    phone: 'Telefon',
    city: 'Şehir',
    linkedin: 'LinkedIn',
    summary: 'Profesyonel Özet',
    namePlaceholder: 'Ahmet Yılmaz',
    titlePlaceholder: 'Yazılım Geliştirici',
    emailPlaceholder: 'ahmet@email.com',
    phonePlaceholder: '+90 555 000 00 00',
    cityPlaceholder: 'İstanbul',
    linkedinPlaceholder: 'linkedin.com/in/ahmet',
    summaryPlaceholder: 'Kendinizden kısaca bahsedin...',

    // Editor - Step 1
    rolePlaceholder: 'Senior Developer',
    companyPlaceholder: 'Tech A.Ş.',
    periodPlaceholder: '2022 - Günümüz',
    descPlaceholder: 'Görev tanımı, başarılar...',
    addExperience: '+ Deneyim Ekle',

    // Editor - Step 2
    schoolPlaceholder: 'İstanbul Teknik Üniversitesi',
    degreePlaceholder: 'Bilgisayar Mühendisliği',
    eduPeriodPlaceholder: '2016 - 2020',
    addEducation: '+ Eğitim Ekle',

    // Editor - Step 3
    skillsLabel: 'Beceriler',
    skillPlaceholder: 'Beceri ekle (React, Python...)',
    languagesLabel: 'Diller',
    langPlaceholder: 'İngilizce (B2)',

    // Editor - Step 4
    projectName: 'Proje Adı',
    projectLink: 'Link (opsiyonel)',
    projectDesc: 'Proje açıklaması...',
    addProject: '+ Proje Ekle',

    // Editor - Step 5
    certNamePlaceholder: 'AWS Certified Developer',
    certIssuerPlaceholder: 'Amazon, Coursera...',
    certDatePlaceholder: '2023',
    addCertificate: '+ Sertifika Ekle',

    // Editor - Step 6
    selected: 'Seçili',
    openGallery: '🎨 Şablon Galerisini Aç',
    colorPalette: 'Renk Paleti',
    font: 'Font',
    downloadPdfBtn: '⬇ PDF Olarak İndir',
    creditsLeft: 'PDF hakkın kaldı',
    pdfPremium: 'PDF indirme Premium gerektirir',

    // Editor - AI
    aiLabel: '✨ AI:',
    aiAnalyze: '📊 CV Analizi',
    aiTranslate: '🌍 Çeviri',
    aiCover: '📝 Kapak Mektubu',
    aiJob: '🎯 İş İlanı Eşleştir',
    aiPremium: '🔒 Premium',
    targetJobPlaceholder: 'Hedef pozisyon (opsiyonel)',
    analyzeBtn: 'Analiz Et',
    analyzing: '⟳ Analiz ediliyor...',
    translateBtn: 'CV\'yi Çevir',
    translating: '⟳ Çevriliyor...',
    translateNote: 'Yeni CV olarak kaydedilir',
    coverRolePlaceholder: 'Pozisyon (Backend Dev)',
    coverCompanyPlaceholder: 'Şirket (Google)',
    coverBtn: 'Oluştur',
    coverGenerating: '⟳ Yazıyor...',
    jobPlaceholder: 'İş ilanı URL\'si veya açıklama yapıştır',
    jobBtn: 'Eşleştir',
    jobAnalyzing: '⟳ Analiz ediliyor...',
    generalScore: 'Genel Skor',
    afterScore: 'Sonrası',
    suggestions: 'Öneriler',
    coverTitle: 'Kapak Mektubu',
    copyBtn: 'Kopyala',
    matchScore: 'Eşleşme',
    translateSuccess: '✓ CV başarıyla çevrildi ve yeni CV olarak kaydedildi.',
    deleteBtn: '✕',
    langEN: 'İngilizce',
    langDE: 'Almanca',
    langFR: 'Fransızca',
    langES: 'İspanyolca',

    // Dashboard ek
    copyError: 'Kopyalama başarısız',
    paymentError: 'Ödeme sayfası açılamadı',
    importBtn: 'İçe Aktar (PDF)',
    importLoading: 'PDF Okunuyor...',
    shareBtn: 'Paylaş',
    unshareBtn: 'Paylaşımı Kapat',
    shareLink: 'Paylaşım Linki:',
  },

  EN: {
    // Auth
    login: 'Sign In',
    register: 'Create Account',
    email: 'Email',
    password: 'Password',
    passwordHint: 'Password (min. 8 characters)',
    fullName: 'Full Name',
    loginBtn: 'Sign In',
    loginLoading: 'Signing in...',
    registerBtn: 'Get Started Free',
    registerLoading: 'Creating account...',
    noAccount: 'Don\'t have an account?',
    hasAccount: 'Already have an account?',
    registerLink: 'Sign up',
    loginLink: 'Sign in',
    loginError: 'Login failed',
    registerError: 'Registration failed',
    passwordShort: 'Password must be at least 8 characters',

    // Dashboard
    hello: 'Hello',
    logout: 'Sign Out',
    premium: '✓ Premium',
    myCvs: 'My CVs',
    newCv: '+ Create New CV',
    templateGallery: '🎨 Template Gallery',
    premiumBannerTitle: '✨ Go Premium',
    premiumBannerDesc: 'Unlimited CVs, 60+ templates, PDF export, AI analysis, language translation, cover letter',
    oneTimePdf: '$9 — Single PDF',
    subscribe: '$14/mo — Premium',
    loading: 'Loading...',
    noCvTitle: 'No CVs yet',
    noCvDesc: 'Start by choosing a template',
    chooseTemplate: '🎨 Choose Template',
    theme: 'Theme',
    copy: '⧉',
    delete: '✕',
    copyingCv: '⟳',
    updatedAt: (date) => new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),

    // Templates Gallery
    galleryTitle: 'Choose a Template',
    galleryDesc: (count) => `${count} professional templates · Click to start editing`,
    searchPlaceholder: '🔍  Search templates...',
    backToDashboard: '← Dashboard',
    showing: (count) => `Showing ${count} templates`,
    freeBadge: '✓ Free',
    premiumBadge: '★ Premium',
    creating: 'Creating...',
    categories: ['All', 'General', 'Software', 'Corporate', 'Creative', 'Academic', 'Healthcare', 'Legal'],
    noResults: 'No results found',

    // Editor - Top bar
    saving: '⟳ Saving...',
    saved: '✓ Saved',
    unsaved: '● Unsaved',
    cvScore: 'CV Score',
    downloadPdf: '⬇ Download PDF',
    templates: '🎨 Templates',

    // Editor - Steps
    steps: ['Personal', 'Experience', 'Education', 'Skills', 'Projects', 'Certificates', 'Theme & Export'],

    // Editor - Step 0
    jobTitle: 'Job Title / Position',
    phone: 'Phone',
    city: 'City',
    linkedin: 'LinkedIn',
    summary: 'Professional Summary',
    namePlaceholder: 'John Smith',
    titlePlaceholder: 'Software Engineer',
    emailPlaceholder: 'john@email.com',
    phonePlaceholder: '+1 555 000 0000',
    cityPlaceholder: 'New York',
    linkedinPlaceholder: 'linkedin.com/in/john',
    summaryPlaceholder: 'Brief professional introduction...',

    // Editor - Step 1
    rolePlaceholder: 'Senior Developer',
    companyPlaceholder: 'Tech Corp.',
    periodPlaceholder: '2022 - Present',
    descPlaceholder: 'Responsibilities, achievements...',
    addExperience: '+ Add Experience',

    // Editor - Step 2
    schoolPlaceholder: 'MIT',
    degreePlaceholder: 'Computer Science',
    eduPeriodPlaceholder: '2016 - 2020',
    addEducation: '+ Add Education',

    // Editor - Step 3
    skillsLabel: 'Skills',
    skillPlaceholder: 'Add a skill (React, Python...)',
    languagesLabel: 'Languages',
    langPlaceholder: 'English (Native)',

    // Editor - Step 4
    projectName: 'Project Name',
    projectLink: 'Link (optional)',
    projectDesc: 'Project description...',
    addProject: '+ Add Project',

    // Editor - Step 5
    certNamePlaceholder: 'AWS Certified Developer',
    certIssuerPlaceholder: 'Amazon, Coursera...',
    certDatePlaceholder: '2023',
    addCertificate: '+ Add Certificate',

    // Editor - Step 6
    selected: 'Selected',
    openGallery: '🎨 Open Template Gallery',
    colorPalette: 'Color Palette',
    font: 'Font',
    downloadPdfBtn: '⬇ Download as PDF',
    creditsLeft: 'PDF credits remaining',
    pdfPremium: 'PDF download requires Premium',

    // Editor - AI
    aiLabel: '✨ AI:',
    aiAnalyze: '📊 CV Analysis',
    aiTranslate: '🌍 Translate',
    aiCover: '📝 Cover Letter',
    aiJob: '🎯 Job Matching',
    aiPremium: '🔒 Premium',
    targetJobPlaceholder: 'Target position (optional)',
    analyzeBtn: 'Analyze',
    analyzing: '⟳ Analyzing...',
    translateBtn: 'Translate CV',
    translating: '⟳ Translating...',
    translateNote: 'Saved as a new CV',
    coverRolePlaceholder: 'Position (Backend Dev)',
    coverCompanyPlaceholder: 'Company (Google)',
    coverBtn: 'Generate',
    coverGenerating: '⟳ Writing...',
    jobPlaceholder: 'Paste job listing URL or description',
    jobBtn: 'Match',
    jobAnalyzing: '⟳ Analyzing...',
    generalScore: 'Overall Score',
    afterScore: 'After Fixes',
    suggestions: 'Suggestions',
    coverTitle: 'Cover Letter',
    copyBtn: 'Copy',
    matchScore: 'Match',
    translateSuccess: '✓ CV translated and saved as a new CV.',
    deleteBtn: '✕',
    langEN: 'English',
    langDE: 'German',
    langFR: 'French',
    langES: 'Spanish',

    // Dashboard extra
    copyError: 'Copy failed',
    paymentError: 'Could not open payment page',
    importBtn: 'Import (PDF)',
    importLoading: 'Parsing PDF...',
    shareBtn: 'Share',
    unshareBtn: 'Unshare',
    shareLink: 'Share Link:',
  }
}
