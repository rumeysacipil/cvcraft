export const PALETTES = {
  midnight: { accent: '#1a1a2e', header: '#1a1a2e', light: '#f0f0f0', line: '#cccccc', name: 'Gece Yarısı' },
  ocean:    { accent: '#1e40af', header: '#1e3a8a', light: '#eff6ff', line: '#bfdbfe', name: 'Okyanus' },
  forest:   { accent: '#166534', header: '#14532d', light: '#f0fdf4', line: '#bbf7d0', name: 'Orman' },
  crimson:  { accent: '#9f1239', header: '#881337', light: '#fff1f2', line: '#fecdd3', name: 'Kırmızı' },
  violet:   { accent: '#6d28d9', header: '#5b21b6', light: '#f5f3ff', line: '#ddd6fe', name: 'Mor' },
  slate:    { accent: '#334155', header: '#1e293b', light: '#f8fafc', line: '#cbd5e1', name: 'Çelik' },
  amber:    { accent: '#92400e', header: '#78350f', light: '#fffbeb', line: '#fde68a', name: 'Kehribar' },
  rose:     { accent: '#9d174d', header: '#831843', light: '#fdf2f8', line: '#fbcfe8', name: 'Gül' },
  teal:     { accent: '#0f766e', header: '#134e4a', light: '#f0fdfa', line: '#99f6e4', name: 'Deniz Yeşili' },
  indigo:   { accent: '#3730a3', header: '#312e81', light: '#eef2ff', line: '#c7d2fe', name: 'Lacivert' },
}

export const FONTS = {
  serif:   { family: 'Georgia, serif',                 name: 'Klasik' },
  sans:    { family: "'Segoe UI', Tahoma, sans-serif", name: 'Modern' },
  verdana: { family: 'Verdana, Geneva, sans-serif',    name: 'Teknik' },
  mono:    { family: "'Courier New', monospace",       name: 'Minimal' },
}

// premium: false = ücretsiz (ilk 15 şablon ücretsiz)
export const TEMPLATES_CATALOG = [
  { id: 'minimal-midnight-serif',   layout: 'minimal',   palette: 'midnight', font: 'serif',   name: 'Klasik',           category: 'Genel',    premium: false },
  { id: 'minimal-ocean-sans',       layout: 'minimal',   palette: 'ocean',    font: 'sans',    name: 'Mavi Klasik',      category: 'Kurumsal', premium: false },
  { id: 'minimal-slate-verdana',    layout: 'minimal',   palette: 'slate',    font: 'verdana', name: 'Çelik Klasik',     category: 'Genel',    premium: false },
  { id: 'minimal-forest-serif',     layout: 'minimal',   palette: 'forest',   font: 'serif',   name: 'Yeşil Klasik',     category: 'Genel',    premium: false },
  { id: 'minimal-teal-verdana',     layout: 'minimal',   palette: 'teal',     font: 'verdana', name: 'Teal Klasik',      category: 'Sağlık',   premium: false },
  { id: 'minimal-indigo-sans',      layout: 'minimal',   palette: 'indigo',   font: 'sans',    name: 'İndigo Klasik',    category: 'Hukuk',    premium: false },
  { id: 'minimal-violet-sans',      layout: 'minimal',   palette: 'violet',   font: 'sans',    name: 'Mor Klasik',       category: 'Kreatif',  premium: false },
  { id: 'minimal-crimson-serif',    layout: 'minimal',   palette: 'crimson',  font: 'serif',   name: 'Kırmızı Klasik',   category: 'Genel',    premium: false },
  { id: 'minimal-amber-mono',       layout: 'minimal',   palette: 'amber',    font: 'mono',    name: 'Kehribar Mono',    category: 'Yazılım',  premium: false },
  { id: 'minimal-rose-serif',       layout: 'minimal',   palette: 'rose',     font: 'serif',   name: 'Gül Klasik',       category: 'Kreatif',  premium: false },
  { id: 'compact-midnight-verdana', layout: 'compact',   palette: 'midnight', font: 'verdana', name: 'Gece Kompakt',     category: 'Akademik', premium: false },
  { id: 'compact-ocean-sans',       layout: 'compact',   palette: 'ocean',    font: 'sans',    name: 'Mavi Kompakt',     category: 'Yazılım',  premium: false },
  { id: 'compact-slate-mono',       layout: 'compact',   palette: 'slate',    font: 'mono',    name: 'Çelik Kompakt',    category: 'Yazılım',  premium: false },
  { id: 'compact-forest-verdana',   layout: 'compact',   palette: 'forest',   font: 'verdana', name: 'Yeşil Kompakt',    category: 'Akademik', premium: false },
  { id: 'compact-teal-serif',       layout: 'compact',   palette: 'teal',     font: 'serif',   name: 'Teal Kompakt',     category: 'Sağlık',   premium: false },
  // Premium
  { id: 'sidebar-ocean-sans',       layout: 'sidebar',   palette: 'ocean',    font: 'sans',    name: 'Mavi Panel',       category: 'Yazılım',  premium: true },
  { id: 'sidebar-midnight-serif',   layout: 'sidebar',   palette: 'midnight', font: 'serif',   name: 'Gece Paneli',      category: 'Kurumsal', premium: true },
  { id: 'sidebar-forest-verdana',   layout: 'sidebar',   palette: 'forest',   font: 'verdana', name: 'Yeşil Panel',      category: 'Genel',    premium: true },
  { id: 'sidebar-violet-sans',      layout: 'sidebar',   palette: 'violet',   font: 'sans',    name: 'Mor Panel',        category: 'Kreatif',  premium: true },
  { id: 'sidebar-slate-mono',       layout: 'sidebar',   palette: 'slate',    font: 'mono',    name: 'Çelik Panel',      category: 'Yazılım',  premium: true },
  { id: 'sidebar-crimson-serif',    layout: 'sidebar',   palette: 'crimson',  font: 'serif',   name: 'Kırmızı Panel',    category: 'Genel',    premium: true },
  { id: 'sidebar-teal-sans',        layout: 'sidebar',   palette: 'teal',     font: 'sans',    name: 'Teal Panel',       category: 'Sağlık',   premium: true },
  { id: 'sidebar-indigo-verdana',   layout: 'sidebar',   palette: 'indigo',   font: 'verdana', name: 'İndigo Panel',     category: 'Hukuk',    premium: true },
  { id: 'sidebar-amber-serif',      layout: 'sidebar',   palette: 'amber',    font: 'serif',   name: 'Kehribar Panel',   category: 'Genel',    premium: true },
  { id: 'sidebar-rose-sans',        layout: 'sidebar',   palette: 'rose',     font: 'sans',    name: 'Gül Panel',        category: 'Kreatif',  premium: true },
  { id: 'timeline-teal-verdana',    layout: 'timeline',  palette: 'teal',     font: 'verdana', name: 'Teal Zaman',       category: 'Yazılım',  premium: true },
  { id: 'timeline-midnight-sans',   layout: 'timeline',  palette: 'midnight', font: 'sans',    name: 'Gece Zaman',       category: 'Genel',    premium: true },
  { id: 'timeline-ocean-serif',     layout: 'timeline',  palette: 'ocean',    font: 'serif',   name: 'Mavi Zaman',       category: 'Kurumsal', premium: true },
  { id: 'timeline-violet-verdana',  layout: 'timeline',  palette: 'violet',   font: 'verdana', name: 'Mor Zaman',        category: 'Kreatif',  premium: true },
  { id: 'timeline-slate-sans',      layout: 'timeline',  palette: 'slate',    font: 'sans',    name: 'Çelik Zaman',      category: 'Genel',    premium: true },
  { id: 'timeline-crimson-serif',   layout: 'timeline',  palette: 'crimson',  font: 'serif',   name: 'Kırmızı Zaman',    category: 'Genel',    premium: true },
  { id: 'timeline-amber-sans',      layout: 'timeline',  palette: 'amber',    font: 'sans',    name: 'Kehribar Zaman',   category: 'Genel',    premium: true },
  { id: 'timeline-indigo-verdana',  layout: 'timeline',  palette: 'indigo',   font: 'verdana', name: 'İndigo Zaman',     category: 'Hukuk',    premium: true },
  { id: 'timeline-rose-mono',       layout: 'timeline',  palette: 'rose',     font: 'mono',    name: 'Gül Zaman',        category: 'Kreatif',  premium: true },
  { id: 'corporate-violet-sans',    layout: 'corporate', palette: 'violet',   font: 'sans',    name: 'Mor Kurumsal',     category: 'Kurumsal', premium: true },
  { id: 'corporate-midnight-serif', layout: 'corporate', palette: 'midnight', font: 'serif',   name: 'Gece Kurumsal',    category: 'Kurumsal', premium: true },
  { id: 'corporate-ocean-verdana',  layout: 'corporate', palette: 'ocean',    font: 'verdana', name: 'Mavi Kurumsal',    category: 'Kurumsal', premium: true },
  { id: 'corporate-slate-sans',     layout: 'corporate', palette: 'slate',    font: 'sans',    name: 'Çelik Kurumsal',   category: 'Hukuk',    premium: true },
  { id: 'corporate-indigo-serif',   layout: 'corporate', palette: 'indigo',   font: 'serif',   name: 'İndigo Kurumsal',  category: 'Hukuk',    premium: true },
  { id: 'corporate-forest-sans',    layout: 'corporate', palette: 'forest',   font: 'sans',    name: 'Yeşil Kurumsal',   category: 'Sağlık',   premium: true },
  { id: 'corporate-teal-verdana',   layout: 'corporate', palette: 'teal',     font: 'verdana', name: 'Teal Kurumsal',    category: 'Sağlık',   premium: true },
  { id: 'compact-violet-sans',      layout: 'compact',   palette: 'violet',   font: 'sans',    name: 'Mor Kompakt',      category: 'Genel',    premium: true },
  { id: 'compact-indigo-mono',      layout: 'compact',   palette: 'indigo',   font: 'mono',    name: 'İndigo Kompakt',   category: 'Hukuk',    premium: true },
  { id: 'compact-crimson-verdana',  layout: 'compact',   palette: 'crimson',  font: 'verdana', name: 'Kırmızı Kompakt',  category: 'Genel',    premium: true },
  { id: 'compact-rose-sans',        layout: 'compact',   palette: 'rose',     font: 'sans',    name: 'Gül Kompakt',      category: 'Kreatif',  premium: true },
  { id: 'compact-amber-mono',       layout: 'compact',   palette: 'amber',    font: 'mono',    name: 'Kehribar Kompakt', category: 'Akademik', premium: true },
  { id: 'creative-rose-serif',      layout: 'creative',  palette: 'rose',     font: 'serif',   name: 'Gül Kreatif',      category: 'Kreatif',  premium: true },
  { id: 'creative-violet-sans',     layout: 'creative',  palette: 'violet',   font: 'sans',    name: 'Mor Kreatif',      category: 'Kreatif',  premium: true },
  { id: 'creative-ocean-sans',      layout: 'creative',  palette: 'ocean',    font: 'sans',    name: 'Mavi Kreatif',     category: 'Kreatif',  premium: true },
  { id: 'creative-forest-verdana',  layout: 'creative',  palette: 'forest',   font: 'verdana', name: 'Yeşil Kreatif',    category: 'Kreatif',  premium: true },
  { id: 'creative-teal-serif',      layout: 'creative',  palette: 'teal',     font: 'serif',   name: 'Teal Kreatif',     category: 'Kreatif',  premium: true },
  { id: 'creative-midnight-serif',  layout: 'creative',  palette: 'midnight', font: 'serif',   name: 'Gece Kreatif',     category: 'Genel',    premium: true },
  
  // ─── YAZILIM MÜHENDİSLİĞİ ÖZEL / %100 ATS UYUMLU ŞABLONLAR ────────────────────
  { id: 'swe-minimal-slate-mono',       layout: 'minimal',   palette: 'slate',    font: 'mono',    name: 'Yazılım Minimal Çelik',     category: 'Yazılım',  premium: false },
  { id: 'swe-minimal-ocean-sans',       layout: 'minimal',   palette: 'ocean',    font: 'sans',    name: 'Backend Mavi Klasik',      category: 'Yazılım',  premium: false },
  { id: 'swe-minimal-midnight-verdana', layout: 'minimal',   palette: 'midnight', font: 'verdana', name: 'DevOps Gece Teknik',       category: 'Yazılım',  premium: false },
  { id: 'swe-minimal-indigo-mono',      layout: 'minimal',   palette: 'indigo',   font: 'mono',    name: 'Frontend İndigo Code',     category: 'Yazılım',  premium: false },
  { id: 'swe-minimal-teal-sans',        layout: 'minimal',   palette: 'teal',     font: 'sans',    name: 'Fullstack Teal Modern',    category: 'Yazılım',  premium: false },
  { id: 'swe-minimal-forest-mono',      layout: 'minimal',   palette: 'forest',   font: 'mono',    name: 'Data Science Orman',       category: 'Yazılım',  premium: false },
  { id: 'swe-compact-slate-sans',       layout: 'compact',   palette: 'slate',    font: 'sans',    name: 'Mimar Çelik Kompakt',      category: 'Yazılım',  premium: false },
  { id: 'swe-compact-ocean-verdana',    layout: 'compact',   palette: 'ocean',    font: 'verdana', name: 'SysAdmin Mavi Kompakt',    category: 'Yazılım',  premium: false },
  { id: 'swe-compact-midnight-mono',    layout: 'compact',   palette: 'midnight', font: 'mono',    name: 'Siber Güvenlik Gece',      category: 'Yazılım',  premium: false },
  { id: 'swe-compact-indigo-sans',      layout: 'compact',   palette: 'indigo',   font: 'sans',    name: 'Mobil Dev İndigo',         category: 'Yazılım',  premium: false },
  { id: 'swe-compact-teal-mono',        layout: 'compact',   palette: 'teal',     font: 'mono',    name: 'Cloud Teal Kompakt',       category: 'Yazılım',  premium: false },
  { id: 'swe-compact-forest-verdana',   layout: 'compact',   palette: 'forest',   font: 'verdana', name: 'QA Yeşil Kompakt',         category: 'Yazılım',  premium: false },
  { id: 'swe-corporate-slate-verdana',  layout: 'corporate', palette: 'slate',    font: 'verdana', name: 'Kurumsal Çelik Tech',      category: 'Yazılım',  premium: false },
  { id: 'swe-corporate-ocean-mono',     layout: 'corporate', palette: 'ocean',    font: 'mono',    name: 'Enterprise Mavi Code',     category: 'Yazılım',  premium: false },
  { id: 'swe-corporate-midnight-sans',  layout: 'corporate', palette: 'midnight', font: 'sans',    name: 'Senior Gece Modern',       category: 'Yazılım',  premium: false },
  { id: 'swe-corporate-indigo-verdana', layout: 'corporate', palette: 'indigo',   font: 'verdana', name: 'Lead İndigo Teknik',       category: 'Yazılım',  premium: false },
  { id: 'swe-corporate-teal-sans',      layout: 'corporate', palette: 'teal',     font: 'sans',    name: 'Agile Teal Kurumsal',      category: 'Yazılım',  premium: false },
  { id: 'swe-corporate-forest-mono',    layout: 'corporate', palette: 'forest',   font: 'mono',    name: 'Big Data Yeşil',           category: 'Yazılım',  premium: false },
  { id: 'swe-minimal-amber-sans',       layout: 'minimal',   palette: 'amber',    font: 'sans',    name: 'Web Dev Kehribar',         category: 'Yazılım',  premium: false },
  { id: 'swe-minimal-rose-mono',        layout: 'minimal',   palette: 'rose',     font: 'mono',    name: 'UI/UX Dev Gül',            category: 'Yazılım',  premium: false },
  { id: 'swe-compact-crimson-verdana',  layout: 'compact',   palette: 'crimson',  font: 'verdana', name: 'DBA Kırmızı Teknik',       category: 'Yazılım',  premium: false },
  { id: 'swe-corporate-violet-sans',    layout: 'corporate', palette: 'violet',   font: 'sans',    name: 'Tech Lead Mor',            category: 'Yazılım',  premium: false },
  { id: 'swe-timeline-slate-mono',      layout: 'timeline',  palette: 'slate',    font: 'mono',    name: 'Git Flow Çelik',           category: 'Yazılım',  premium: false },
  { id: 'swe-timeline-ocean-sans',      layout: 'timeline',  palette: 'ocean',    font: 'sans',    name: 'Release Mavi',             category: 'Yazılım',  premium: false },
  { id: 'swe-timeline-midnight-verdana',layout: 'timeline',  palette: 'midnight', font: 'verdana', name: 'Sprint Gece',              category: 'Yazılım',  premium: false },
  { id: 'swe-minimal-slate-serif',      layout: 'minimal',   palette: 'slate',    font: 'serif',   name: 'Akademik Yazılım Çelik',   category: 'Yazılım',  premium: false },
  { id: 'swe-compact-ocean-serif',      layout: 'compact',   palette: 'ocean',    font: 'serif',   name: 'Araştırmacı Mavi Kompakt', category: 'Yazılım',  premium: false },
  { id: 'swe-corporate-midnight-mono',  layout: 'corporate', palette: 'midnight', font: 'mono',    name: 'Terminal Gece',            category: 'Yazılım',  premium: false },
  { id: 'swe-minimal-indigo-verdana',   layout: 'minimal',   palette: 'indigo',   font: 'verdana', name: 'Platform Eng İndigo',      category: 'Yazılım',  premium: false },
  { id: 'swe-compact-teal-sans',        layout: 'compact',   palette: 'teal',     font: 'sans',    name: 'Cloud Native Teal',        category: 'Yazılım',  premium: false },
  { id: 'swe-corporate-forest-verdana', layout: 'corporate', palette: 'forest',   font: 'verdana', name: 'SRE Yeşil',                category: 'Yazılım',  premium: false },
  { id: 'swe-timeline-indigo-mono',     layout: 'timeline',  palette: 'indigo',   font: 'mono',    name: 'Blockchain İndigo',        category: 'Yazılım',  premium: false },
  { id: 'swe-minimal-violet-verdana',   layout: 'minimal',   palette: 'violet',   font: 'verdana', name: 'Game Dev Mor',             category: 'Yazılım',  premium: false },
  { id: 'swe-compact-amber-sans',       layout: 'compact',   palette: 'amber',    font: 'sans',    name: 'Embedded Kehribar',        category: 'Yazılım',  premium: false },
  { id: 'swe-corporate-rose-mono',      layout: 'corporate', palette: 'rose',     font: 'mono',    name: 'ML Eng Gül',               category: 'Yazılım',  premium: false },

  // ─── %100 SAF ATS ODAKLI (TABLOSUZ, TEK SÜTUN) ŞABLONLAR ────────────────────────
  { id: 'ats-pure-slate-serif',       layout: 'atsHarvard', palette: 'slate',    font: 'serif',   name: 'ATS Harvard Klasik',      category: 'Yazılım',  premium: false },
  { id: 'ats-pure-ocean-sans',        layout: 'atsStrict',  palette: 'ocean',    font: 'sans',    name: 'ATS Strict Mavi',         category: 'Yazılım',  premium: false },
  { id: 'ats-pure-midnight-verdana',  layout: 'atsHarvard', palette: 'midnight', font: 'verdana', name: 'ATS Harvard Gece',        category: 'Yazılım',  premium: false },
  { id: 'ats-pure-indigo-mono',       layout: 'atsStrict',  palette: 'indigo',   font: 'mono',    name: 'ATS Strict İndigo Code',  category: 'Yazılım',  premium: false },
  { id: 'ats-pure-teal-sans',         layout: 'atsHarvard', palette: 'teal',     font: 'sans',    name: 'ATS Harvard Teal',        category: 'Yazılım',  premium: false },
  { id: 'ats-pure-forest-mono',       layout: 'atsStrict',  palette: 'forest',   font: 'mono',    name: 'ATS Strict Orman Code',   category: 'Yazılım',  premium: false },
  { id: 'ats-pure-slate-sans',        layout: 'atsHarvard', palette: 'slate',    font: 'sans',    name: 'ATS Harvard Çelik',       category: 'Yazılım',  premium: false },
  { id: 'ats-pure-ocean-verdana',     layout: 'atsStrict',  palette: 'ocean',    font: 'verdana', name: 'ATS Strict Mavi Teknik',  category: 'Yazılım',  premium: false },
  { id: 'ats-pure-midnight-mono',     layout: 'atsHarvard', palette: 'midnight', font: 'mono',    name: 'ATS Harvard Gece Code',   category: 'Yazılım',  premium: false },
  { id: 'ats-pure-indigo-sans',       layout: 'atsStrict',  palette: 'indigo',   font: 'sans',    name: 'ATS Strict İndigo',       category: 'Yazılım',  premium: false },
  { id: 'ats-pure-teal-mono',         layout: 'atsHarvard', palette: 'teal',     font: 'mono',    name: 'ATS Harvard Teal Code',   category: 'Yazılım',  premium: false },
  { id: 'ats-pure-forest-verdana',    layout: 'atsStrict',  palette: 'forest',   font: 'verdana', name: 'ATS Strict Orman Teknik', category: 'Yazılım',  premium: false },
  { id: 'ats-pure-amber-sans',        layout: 'atsHarvard', palette: 'amber',    font: 'sans',    name: 'ATS Harvard Kehribar',    category: 'Yazılım',  premium: false },
  { id: 'ats-pure-rose-mono',         layout: 'atsStrict',  palette: 'rose',     font: 'mono',    name: 'ATS Strict Gül',          category: 'Yazılım',  premium: false },
  { id: 'ats-pure-crimson-verdana',   layout: 'atsHarvard', palette: 'crimson',  font: 'verdana', name: 'ATS Harvard Kırmızı',     category: 'Yazılım',  premium: false },
  { id: 'ats-pure-violet-sans',       layout: 'atsStrict',  palette: 'violet',   font: 'sans',    name: 'ATS Strict Mor',          category: 'Yazılım',  premium: false },
  // Adding variations
  { id: 'ats-pro-ocean-serif',        layout: 'atsHarvard', palette: 'ocean',    font: 'serif',   name: 'ATS Pro Mavi Klasik',     category: 'Yazılım',  premium: true },
  { id: 'ats-pro-midnight-sans',      layout: 'atsStrict',  palette: 'midnight', font: 'sans',    name: 'ATS Pro Gece Modern',     category: 'Yazılım',  premium: true },
  { id: 'ats-pro-slate-verdana',      layout: 'atsHarvard', palette: 'slate',    font: 'verdana', name: 'ATS Pro Çelik Teknik',    category: 'Yazılım',  premium: true },
  { id: 'ats-pro-indigo-mono',        layout: 'atsStrict',  palette: 'indigo',   font: 'mono',    name: 'ATS Pro İndigo Terminal', category: 'Yazılım',  premium: true },
  { id: 'ats-pro-teal-serif',         layout: 'atsHarvard', palette: 'teal',     font: 'serif',   name: 'ATS Pro Teal Klasik',     category: 'Yazılım',  premium: true },
  { id: 'ats-pro-forest-sans',        layout: 'atsStrict',  palette: 'forest',   font: 'sans',    name: 'ATS Pro Orman Modern',    category: 'Yazılım',  premium: true },
  { id: 'ats-pro-slate-mono',         layout: 'atsHarvard', palette: 'slate',    font: 'mono',    name: 'ATS Pro Çelik Shell',     category: 'Yazılım',  premium: true },
  { id: 'ats-pro-ocean-verdana',      layout: 'atsStrict',  palette: 'ocean',    font: 'verdana', name: 'ATS Pro Mavi System',     category: 'Yazılım',  premium: true },
  { id: 'ats-pro-midnight-mono',      layout: 'atsHarvard', palette: 'midnight', font: 'mono',    name: 'ATS Pro Gece Console',    category: 'Yazılım',  premium: true },
  { id: 'ats-pro-indigo-sans',        layout: 'atsStrict',  palette: 'indigo',   font: 'sans',    name: 'ATS Pro İndigo Flow',     category: 'Yazılım',  premium: true },
  { id: 'ats-pro-teal-mono',          layout: 'atsHarvard', palette: 'teal',     font: 'mono',    name: 'ATS Pro Teal Code',       category: 'Yazılım',  premium: true },
  { id: 'ats-pro-forest-verdana',     layout: 'atsStrict',  palette: 'forest',   font: 'verdana', name: 'ATS Pro Orman Data',      category: 'Yazılım',  premium: true },
  { id: 'ats-pro-amber-sans',         layout: 'atsHarvard', palette: 'amber',    font: 'sans',    name: 'ATS Pro Kehribar Web',    category: 'Yazılım',  premium: true },
  { id: 'ats-pro-rose-mono',          layout: 'atsStrict',  palette: 'rose',     font: 'mono',    name: 'ATS Pro Gül UI',          category: 'Yazılım',  premium: true },
  { id: 'ats-pro-crimson-verdana',    layout: 'atsHarvard', palette: 'crimson',  font: 'verdana', name: 'ATS Pro Kırmızı DB',      category: 'Yazılım',  premium: true },
  { id: 'ats-pro-violet-sans',        layout: 'atsStrict',  palette: 'violet',   font: 'sans',    name: 'ATS Pro Mor Lead',        category: 'Yazılım',  premium: true },
  { id: 'ats-max-ocean-serif',        layout: 'atsHarvard', palette: 'ocean',    font: 'serif',   name: 'ATS Ultra Mavi',          category: 'Yazılım',  premium: true },
  { id: 'ats-max-midnight-sans',      layout: 'atsStrict',  palette: 'midnight', font: 'sans',    name: 'ATS Ultra Gece',          category: 'Yazılım',  premium: true },
  { id: 'ats-max-slate-verdana',      layout: 'atsHarvard', palette: 'slate',    font: 'verdana', name: 'ATS Ultra Çelik',         category: 'Yazılım',  premium: true },
  { id: 'ats-max-indigo-mono',        layout: 'atsStrict',  palette: 'indigo',   font: 'mono',    name: 'ATS Ultra İndigo',        category: 'Yazılım',  premium: true },
  { id: 'ats-max-teal-serif',         layout: 'atsHarvard', palette: 'teal',     font: 'serif',   name: 'ATS Ultra Teal',          category: 'Yazılım',  premium: true },
  { id: 'ats-max-forest-sans',        layout: 'atsStrict',  palette: 'forest',   font: 'sans',    name: 'ATS Ultra Orman',         category: 'Yazılım',  premium: true },
  { id: 'ats-max-slate-mono',         layout: 'atsHarvard', palette: 'slate',    font: 'mono',    name: 'ATS Ultra Çelik Code',    category: 'Yazılım',  premium: true },
  { id: 'ats-max-ocean-verdana',      layout: 'atsStrict',  palette: 'ocean',    font: 'verdana', name: 'ATS Ultra Mavi Teknik',   category: 'Yazılım',  premium: true },
  { id: 'ats-max-midnight-mono',      layout: 'atsHarvard', palette: 'midnight', font: 'mono',    name: 'ATS Ultra Gece Terminal', category: 'Yazılım',  premium: true },
  { id: 'ats-max-indigo-sans',        layout: 'atsStrict',  palette: 'indigo',   font: 'sans',    name: 'ATS Ultra İndigo Flow',   category: 'Yazılım',  premium: true },
  { id: 'ats-max-teal-mono',          layout: 'atsHarvard', palette: 'teal',     font: 'mono',    name: 'ATS Ultra Teal Code',     category: 'Yazılım',  premium: true },
  { id: 'ats-max-forest-verdana',     layout: 'atsStrict',  palette: 'forest',   font: 'verdana', name: 'ATS Ultra Orman Teknik',  category: 'Yazılım',  premium: true },
  { id: 'ats-max-amber-sans',         layout: 'atsHarvard', palette: 'amber',    font: 'sans',    name: 'ATS Ultra Kehribar',      category: 'Yazılım',  premium: true },
  { id: 'ats-max-rose-mono',          layout: 'atsStrict',  palette: 'rose',     font: 'mono',    name: 'ATS Ultra Gül',           category: 'Yazılım',  premium: true }
]

export const CATEGORIES = ['Tümü', 'Genel', 'Yazılım', 'Kurumsal', 'Kreatif', 'Akademik', 'Sağlık', 'Hukuk']

export function getTemplateConfig(templateId) {
  return TEMPLATES_CATALOG.find(t => t.id === templateId) || TEMPLATES_CATALOG[0]
}

export function CVTemplate({ templateId, data }) {
  const config = getTemplateConfig(templateId)
  const p = PALETTES[config.palette] || PALETTES.midnight
  const f = FONTS[config.font] || FONTS.serif
  const props = { data, p, f }
  switch (config.layout) {
    case 'sidebar':   return <LayoutSidebar   {...props} />
    case 'timeline':  return <LayoutTimeline  {...props} />
    case 'corporate': return <LayoutCorporate {...props} />
    case 'compact':   return <LayoutCompact   {...props} />
    case 'creative':  return <LayoutCreative  {...props} />
    case 'atsHarvard':return <LayoutAtsHarvard {...props} />
    case 'atsStrict': return <LayoutAtsStrict {...props} />
    default:          return <LayoutMinimal   {...props} />
  }
}

// ─── ATS UYUMLU ORTAK BİLEŞENLER ─────────────────────────────────────────────

// ATS uyumlu: bullet list olarak beceriler
function SkillList({ skills, color, dotColor }) {
  if (!skills?.length) return null
  return (
    <div style={{ columns: skills.length > 6 ? 2 : 1, columnGap: '16px' }}>
      {skills.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: color || '#444', marginBottom: '4px', breakInside: 'avoid' }}>
          <span style={{ color: dotColor, fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>▪</span>
          <span>{s}</span>
        </div>
      ))}
    </div>
  )
}

// ATS uyumlu: dil listesi düz metin formatında
function LangList({ languages, color }) {
  if (!languages?.filter(l => l).length) return null
  return (
    <div style={{ fontSize: '12px', color: color || '#444', lineHeight: 1.8 }}>
      {languages.filter(l => l).map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
          <span style={{ color: color || '#888', fontSize: '10px' }}>▪</span>
          <span>{l}</span>
        </div>
      ))}
    </div>
  )
}

function ProjectList({ projects, accent }) {
  if (!projects?.length) return null
  return projects.map((proj, i) => (
    <div key={i} style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '13px' }}>{proj.name}</span>
        {proj.link && <a href={proj.link} style={{ fontSize: '11px', color: accent, textDecoration: 'none' }}>↗ {proj.link}</a>}
      </div>
      {proj.desc && <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.6, marginTop: '3px' }}>{proj.desc}</p>}
    </div>
  ))
}

function CertList({ certs, color }) {
  if (!certs?.length) return null
  return certs.map((c, i) => (
    <div key={i} style={{ marginBottom: '6px' }}>
      <span style={{ fontWeight: 700, fontSize: '12px' }}>{c.name}</span>
      {c.issuer && <span style={{ color: color || '#666', fontSize: '11px' }}> — {c.issuer}</span>}
      {c.date && <span style={{ color: '#999', fontSize: '11px' }}> ({c.date})</span>}
    </div>
  ))
}

// İkon bileşeni (ATS uyumlu — Unicode semboller kullanır)
function ContactLine({ email, phone, location, linkedin, color }) {
  const items = [
    email    && { icon: '✉', text: email },
    phone    && { icon: '✆', text: phone },
    location && { icon: '⚲', text: location },
    linkedin && { icon: 'in', text: linkedin },
  ].filter(Boolean)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px', color: color || '#666' }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontWeight: 700, fontSize: '11px', opacity: 0.8 }}>{item.icon}</span>
          <span>{item.text}</span>
        </span>
      ))}
    </div>
  )
}

// ─── LAYOUT 1: Minimal (Benjamin Shah tarzı — sade, ATS %99) ─────────────────
function LayoutMinimal({ data, p, f }) {
  const S = ({ title }) => (
    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: p.accent, borderBottom: `2px solid ${p.accent}`, paddingBottom: '4px', marginBottom: '10px', marginTop: '18px', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>{title}</div>
  )
  return (
    <div style={{ fontFamily: f.family, padding: '36px 44px', color: '#222', fontSize: '13px', lineHeight: 1.5 }}>
      {/* Header */}
      <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: `1px solid ${p.line}` }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 4px', color: p.accent, textTransform: 'uppercase', letterSpacing: '1px' }}>{data.name || 'Ad Soyad'}</h1>
        {data.title && <p style={{ fontSize: '14px', color: '#555', marginBottom: '10px', fontStyle: 'italic' }}>{data.title}</p>}
        <ContactLine email={data.email} phone={data.phone} location={data.location} linkedin={data.linkedin} color="#555" />
      </div>

      {data.summary && (<><S title="Summary" /><p style={{ color: '#444', lineHeight: 1.7 }}>{data.summary}</p></>)}

      {data.experience?.length > 0 && (
        <><S title="Work Experience" />{data.experience.map((e, i) => (
          <div key={i} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><span style={{ fontWeight: 700, fontSize: '13px' }}>{e.role}</span>{e.company && <span style={{ color: p.accent, fontWeight: 600 }}>, {e.company}</span>}</div>
              {e.period && <span style={{ fontSize: '12px', color: '#888', flexShrink: 0, marginLeft: '12px' }}>{e.period}</span>}
            </div>
            {e.desc && <p style={{ marginTop: '5px', color: '#555', lineHeight: 1.6 }}>{e.desc}</p>}
          </div>
        ))}</>
      )}

      {data.education?.length > 0 && (
        <><S title="Education" />{data.education.map((e, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div><span style={{ fontWeight: 700 }}>{e.degree}</span>{e.school && <span style={{ color: '#555' }}>, {e.school}</span>}</div>
            {e.period && <span style={{ fontSize: '12px', color: '#888' }}>{e.period}</span>}
          </div>
        ))}</>
      )}

      {(data.skills?.length > 0 || data.languages?.filter(l=>l).length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: data.languages?.filter(l=>l).length > 0 ? '2fr 1fr' : '1fr', gap: '24px' }}>
          {data.skills?.length > 0 && (
            <div><S title="Technical Skills" /><SkillList skills={data.skills} dotColor={p.accent} /></div>
          )}
          {data.languages?.filter(l=>l).length > 0 && (
            <div><S title="Languages" /><LangList languages={data.languages} /></div>
          )}
        </div>
      )}

      {data.projects?.length > 0 && (<><S title="Projects" /><ProjectList projects={data.projects} accent={p.accent} /></>)}
      {data.certificates?.length > 0 && (<><S title="Certifications" /><CertList certs={data.certificates} color={p.accent} /></>)}
    </div>
  )
}

// ─── LAYOUT 2: Sidebar ────────────────────────────────────────────────────────
function LayoutSidebar({ data, p, f }) {
  const SS = ({ title }) => <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px', marginBottom: '8px', marginTop: '16px', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>{title}</div>
  const MS = ({ title }) => <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: p.accent, borderBottom: `2px solid ${p.line}`, paddingBottom: '4px', marginBottom: '12px', marginTop: '16px', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>{title}</div>
  return (
    <div style={{ fontFamily: f.family, display: 'flex', color: '#222', fontSize: '13px', minHeight: '297mm', height: '100%' }}>
      <div style={{ width: '210px', flexShrink: 0, background: p.header, padding: '32px 18px', minHeight: '297mm' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'white', lineHeight: 1.2, margin: '0 0 4px' }}>{data.name || 'Ad Soyad'}</h1>
        {data.title && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginTop: '4px', lineHeight: 1.4, fontStyle: 'italic' }}>{data.title}</p>}
        <SS title="Contact" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>✆ {data.phone}</span>}
          {data.location && <span>⚲ {data.location}</span>}
          {data.linkedin && <span style={{ wordBreak: 'break-all' }}>in {data.linkedin}</span>}
        </div>
        {data.skills?.length > 0 && (<><SS title="Skills" /><SkillList skills={data.skills} color="rgba(255,255,255,0.85)" dotColor="rgba(255,255,255,0.6)" /></>)}
        {data.languages?.filter(l=>l).length > 0 && (<><SS title="Languages" /><LangList languages={data.languages} color="rgba(255,255,255,0.85)" /></>)}
        {data.certificates?.length > 0 && (<><SS title="Certifications" />{data.certificates.map((c,i)=><p key={i} style={{fontSize:'10px',color:'rgba(255,255,255,0.75)',marginBottom:'4px'}}>{c.name}</p>)}</>) }
      </div>
      <div style={{ flex: 1, padding: '32px 28px' }}>
        {data.summary && (<><MS title="Profile" /><p style={{ color: '#444', lineHeight: 1.7, marginTop: '-4px' }}>{data.summary}</p></>)}
        {data.experience?.length > 0 && (
          <><MS title="Experience" />{data.experience.map((e,i)=>(
            <div key={i} style={{marginBottom:'14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontWeight:700,fontSize:'13px'}}>{e.role}</span>
                {e.period&&<span style={{fontSize:'11px',color:'white',background:p.accent,padding:'2px 8px',borderRadius:'10px',flexShrink:0}}>{e.period}</span>}
              </div>
              {e.company&&<p style={{fontSize:'12px',color:p.accent,fontWeight:600,marginTop:'2px'}}>{e.company}</p>}
              {e.desc&&<p style={{marginTop:'5px',color:'#555',lineHeight:1.6,fontSize:'12px'}}>{e.desc}</p>}
            </div>
          ))}</>
        )}
        {data.education?.length > 0 && (<><MS title="Education" />{data.education.map((e,i)=>(
          <div key={i} style={{marginBottom:'10px'}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:700}}>{e.school}</span>{e.period&&<span style={{fontSize:'11px',color:'#888'}}>{e.period}</span>}</div>
            {e.degree&&<p style={{fontSize:'12px',color:'#666',marginTop:'2px'}}>{e.degree}</p>}
          </div>
        ))}</>)}
        {data.projects?.length > 0 && (<><MS title="Projects" /><ProjectList projects={data.projects} accent={p.accent} /></>)}
      </div>
    </div>
  )
}

// ─── LAYOUT 3: Timeline ───────────────────────────────────────────────────────
function LayoutTimeline({ data, p, f }) {
  const S = ({ title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0 12px', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
      <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: p.accent }}>{title}</div>
      <div style={{ flex: 1, height: '1.5px', background: p.line }} />
    </div>
  )
  return (
    <div style={{ fontFamily: f.family, color: '#222', fontSize: '12px', minHeight: '297mm' }}>
      <div style={{ background: p.header, padding: '28px 40px 22px', position: 'relative', overflow: 'hidden' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'white', margin: 0 }}>{data.name || 'Ad Soyad'}</h1>
        {data.title && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px' }}>{data.title}</p>}
        <div style={{ marginTop: '12px' }}>
          <ContactLine email={data.email} phone={data.phone} location={data.location} linkedin={data.linkedin} color="rgba(255,255,255,0.75)" />
        </div>
      </div>
      <div style={{ padding: '10px 40px 32px' }}>
        {data.summary && (<><S title="Summary" /><p style={{ color: '#444', lineHeight: 1.7 }}>{data.summary}</p></>)}
        {data.experience?.length > 0 && (
          <><S title="Experience" />
          <div style={{ paddingLeft: '20px', borderLeft: `2px solid ${p.line}` }}>
            {data.experience.map((e,i)=>(
              <div key={i} style={{marginBottom:'14px',position:'relative'}}>
                <div style={{position:'absolute',left:'-26px',top:'4px',width:'10px',height:'10px',borderRadius:'50%',background:p.accent,border:'2px solid white',boxShadow:`0 0 0 2px ${p.line}`}} />
                {e.period&&<span style={{fontSize:'10px',color:p.accent,fontWeight:700,textTransform:'uppercase'}}>{e.period}</span>}
                <div style={{fontWeight:700,fontSize:'13px',marginTop:'2px'}}>{e.role}{e.company&&<span style={{fontWeight:400,color:'#666'}}> — {e.company}</span>}</div>
                {e.desc&&<p style={{color:'#555',lineHeight:1.6,marginTop:'3px'}}>{e.desc}</p>}
              </div>
            ))}
          </div></>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '8px' }}>
          <div>
            {data.education?.length > 0 && (<><S title="Education" />{data.education.map((e,i)=>(
              <div key={i} style={{marginBottom:'8px'}}><div style={{fontWeight:700}}>{e.school}</div><div style={{color:'#666',fontSize:'11px'}}>{e.degree}</div>{e.period&&<div style={{color:'#999',fontSize:'11px'}}>{e.period}</div>}</div>
            ))}</>)}
            {data.certificates?.length > 0 && (<><S title="Certifications" /><CertList certs={data.certificates} color={p.accent} /></>)}
          </div>
          <div>
            {data.skills?.length > 0 && (<><S title="Skills" /><SkillList skills={data.skills} dotColor={p.accent} /></>)}
            {data.languages?.filter(l=>l).length > 0 && (<><S title="Languages" /><LangList languages={data.languages} /></>)}
          </div>
        </div>
        {data.projects?.length > 0 && (<><S title="Projects" /><ProjectList projects={data.projects} accent={p.accent} /></>)}
      </div>
    </div>
  )
}

// ─── LAYOUT 4: Corporate ──────────────────────────────────────────────────────
function LayoutCorporate({ data, p, f }) {
  const AT = ({ title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', marginTop: '18px', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
      <div style={{ width: '4px', height: '18px', background: p.accent, borderRadius: '2px', flexShrink: 0 }} />
      <h2 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: p.header, margin: 0 }}>{title}</h2>
    </div>
  )
  return (
    <div style={{ fontFamily: f.family, color: '#222', fontSize: '13px', minHeight: '297mm' }}>
      <div style={{ background: p.header, padding: '26px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'white', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>{data.name || 'AD SOYAD'}</h1>
            {data.title && <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginTop: '4px' }}>{data.title}</p>}
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', color: 'rgba(255,255,255,0.75)', lineHeight: 2 }}>
            {data.email && <div>✉ {data.email}</div>}
            {data.phone && <div>✆ {data.phone}</div>}
            {data.location && <div>⚲ {data.location}</div>}
            {data.linkedin && <div>in {data.linkedin}</div>}
          </div>
        </div>
      </div>
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${p.accent}, ${p.line})` }} />
      <div style={{ padding: '24px 40px' }}>
        {data.summary && (
          <div style={{ background: p.light, borderLeft: `4px solid ${p.accent}`, padding: '12px 16px', marginBottom: '18px', borderRadius: '0 6px 6px 0' }}>
            <p style={{ color: '#444', lineHeight: 1.7, margin: 0 }}>{data.summary}</p>
          </div>
        )}
        {data.experience?.length > 0 && (
          <><AT title="Professional Experience" />{data.experience.map((e,i)=>(
            <div key={i} style={{marginBottom:'14px',paddingBottom:'12px',borderBottom:i<data.experience.length-1?`1px solid ${p.line}`:'none'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'3px'}}>
                <div><span style={{fontWeight:700,fontSize:'13px'}}>{e.role}</span>{e.company&&<span style={{color:p.accent,fontWeight:600}}> | {e.company}</span>}</div>
                {e.period&&<span style={{fontSize:'11px',color:'#888',background:p.light,padding:'2px 10px',borderRadius:'10px',border:`1px solid ${p.line}`,flexShrink:0}}>{e.period}</span>}
              </div>
              {e.desc&&<p style={{color:'#555',lineHeight:1.6,margin:'4px 0 0',fontSize:'12px'}}>{e.desc}</p>}
            </div>
          ))}</>
        )}
        {data.projects?.length > 0 && (<><AT title="Projects" /><ProjectList projects={data.projects} accent={p.accent} /></>)}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          <div>
            {data.education?.length > 0 && (<><AT title="Education" />{data.education.map((e,i)=>(
              <div key={i} style={{marginBottom:'8px'}}><div style={{fontWeight:700}}>{e.school}</div><div style={{color:'#666',fontSize:'12px'}}>{e.degree}</div>{e.period&&<div style={{color:'#999',fontSize:'11px'}}>{e.period}</div>}</div>
            ))}</>)}
            {data.certificates?.length > 0 && (<><AT title="Certifications" /><CertList certs={data.certificates} color={p.accent} /></>)}
          </div>
          <div>
            {data.skills?.length > 0 && (<><AT title="Skills" /><SkillList skills={data.skills} dotColor={p.accent} /></>)}
            {data.languages?.filter(l=>l).length > 0 && (<><AT title="Languages" /><LangList languages={data.languages} /></>)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LAYOUT 5: Compact (yoğun bilgi, ATS %96) ────────────────────────────────
function LayoutCompact({ data, p, f }) {
  const S = ({ title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0 6px', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
      <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: p.accent, whiteSpace: 'nowrap' }}>{title}</span>
      <div style={{ flex: 1, height: '1px', background: p.line }} />
    </div>
  )
  return (
    <div style={{ fontFamily: f.family, padding: '28px 38px', color: '#1a1a1a', fontSize: '12px', lineHeight: 1.45 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: p.header }}>{data.name || 'Ad Soyad'}</h1>
          {data.title && <p style={{ margin: '2px 0 0', color: p.accent, fontWeight: 600, fontSize: '12px' }}>{data.title}</p>}
        </div>
        <div style={{ textAlign: 'right', fontSize: '11px', color: '#555', lineHeight: 1.8 }}>
          {data.email && <div>✉ {data.email}</div>}
          {data.phone && <div>✆ {data.phone}</div>}
          {data.location && <div>⚲ {data.location}</div>}
          {data.linkedin && <div>in {data.linkedin}</div>}
        </div>
      </div>
      <div style={{ height: '2px', background: `linear-gradient(90deg, ${p.accent}, ${p.line})`, marginBottom: '6px' }} />
      {data.summary && (<><S title="Summary" /><p style={{ color: '#444', lineHeight: 1.6 }}>{data.summary}</p></>)}
      {data.experience?.length > 0 && (
        <><S title="Experience" />{data.experience.map((e,i)=>(
          <div key={i} style={{marginBottom:'8px'}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:700}}>{e.role}{e.company?`, ${e.company}`:''}</span><span style={{color:'#888',fontSize:'11px',flexShrink:0,marginLeft:'8px'}}>{e.period}</span></div>
            {e.desc&&<p style={{color:'#555',marginTop:'2px',lineHeight:1.5}}>{e.desc}</p>}
          </div>
        ))}</>
      )}
      {data.education?.length > 0 && (
        <><S title="Education" />{data.education.map((e,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}><span><strong>{e.degree}</strong>{e.school?`, ${e.school}`:''}</span><span style={{color:'#888',fontSize:'11px'}}>{e.period}</span></div>
        ))}</>
      )}
      {data.projects?.length > 0 && (
        <><S title="Projects" />{data.projects.map((proj,i)=>(
          <div key={i} style={{marginBottom:'6px'}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:700}}>{proj.name}</span>{proj.link&&<span style={{fontSize:'11px',color:p.accent}}>{proj.link}</span>}</div>
            {proj.desc&&<p style={{color:'#555',marginTop:'2px',lineHeight:1.5}}>{proj.desc}</p>}
          </div>
        ))}</>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginTop: '4px' }}>
        <div>{data.skills?.length > 0 && (<><S title="Skills" /><SkillList skills={data.skills} dotColor={p.accent} /></>)}</div>
        <div>{data.languages?.filter(l=>l).length > 0 && (<><S title="Languages" /><LangList languages={data.languages} /></>)}</div>
        <div>{data.certificates?.length > 0 && (<><S title="Certifications" /><CertList certs={data.certificates} color={p.accent} /></>)}</div>
      </div>
    </div>
  )
}

// ─── LAYOUT 6: Creative ───────────────────────────────────────────────────────
function LayoutCreative({ data, p, f }) {
  const MS = ({ title }) => <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: p.accent, marginBottom: '10px', marginTop: '18px', paddingBottom: '5px', borderBottom: `2px solid ${p.line}`, pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>{title}</div>
  const SS = ({ title }) => <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'white', opacity: 0.7, marginBottom: '8px', marginTop: '14px', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>{title}</div>
  return (
    <div style={{ fontFamily: f.family, display: 'flex', color: '#222', fontSize: '13px', minHeight: '297mm', height: '100%' }}>
      <div style={{ flex: 1, padding: '36px 28px 32px 36px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: p.header }}>{data.name || 'Ad Soyad'}</h1>
        {data.title && <p style={{ color: p.accent, fontSize: '13px', fontStyle: 'italic', marginTop: '3px' }}>{data.title}</p>}
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${p.accent}, ${p.line}, transparent)`, margin: '10px 0 12px' }} />
        {data.summary && (<><MS title="Profile" /><p style={{ color: '#555', lineHeight: 1.7, marginTop: '-4px' }}>{data.summary}</p></>)}
        {data.experience?.length > 0 && (
          <><MS title="Experience" />{data.experience.map((e,i)=>(
            <div key={i} style={{marginBottom:'12px',paddingLeft:'10px',borderLeft:`2px solid ${p.line}`}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div><span style={{fontWeight:700}}>{e.role}</span>{e.company&&<span style={{color:p.accent,fontStyle:'italic'}}> @ {e.company}</span>}</div>
                {e.period&&<span style={{fontSize:'11px',color:'#999',flexShrink:0,marginLeft:'8px'}}>{e.period}</span>}
              </div>
              {e.desc&&<p style={{color:'#666',lineHeight:1.6,marginTop:'3px',fontSize:'12px'}}>{e.desc}</p>}
            </div>
          ))}</>
        )}
        {data.education?.length > 0 && (<><MS title="Education" />{data.education.map((e,i)=>(
          <div key={i} style={{marginBottom:'7px'}}><span style={{fontWeight:700}}>{e.school}</span>{e.degree&&<span style={{color:'#666'}}> — {e.degree}</span>}{e.period&&<span style={{color:'#999',fontSize:'11px'}}> ({e.period})</span>}</div>
        ))}</>)}
        {data.projects?.length > 0 && (<><MS title="Projects" /><ProjectList projects={data.projects} accent={p.accent} /></>)}
      </div>
      <div style={{ width: '190px', flexShrink: 0, background: p.header, padding: '36px 18px 32px', minHeight: '297mm' }}>
        <SS title="Contact" />
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.9 }}>
          {data.email && <div>✉ {data.email}</div>}
          {data.phone && <div>✆ {data.phone}</div>}
          {data.location && <div>⚲ {data.location}</div>}
          {data.linkedin && <div style={{ wordBreak: 'break-all' }}>in {data.linkedin}</div>}
        </div>
        {data.skills?.length > 0 && (<><SS title="Skills" /><SkillList skills={data.skills} color="rgba(255,255,255,0.85)" dotColor="rgba(255,255,255,0.6)" /></>)}
        {data.languages?.filter(l=>l).length > 0 && (<><SS title="Languages" /><LangList languages={data.languages} color="rgba(255,255,255,0.85)" /></>)}
        {data.certificates?.length > 0 && (<><SS title="Certifications" />{data.certificates.map((c,i)=><p key={i} style={{fontSize:'10px',color:'rgba(255,255,255,0.75)',marginBottom:'4px'}}>{c.name}</p>)}</>)}
      </div>
    </div>
  )
}

// ─── LAYOUT 7: ATS Harvard (En Temiz, Dünyaca Kabul Gören Format) ─────────────
function LayoutAtsHarvard({ data, p, f }) {
  const S = ({ title }) => (
    <h2 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: p.header, borderBottom: `1px solid ${p.line}`, paddingBottom: '3px', marginBottom: '8px', marginTop: '16px', letterSpacing: '1px', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>{title}</h2>
  )
  return (
    <div style={{ fontFamily: f.family, padding: '44px 50px', color: '#111', fontSize: '12.5px', lineHeight: 1.6 }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '4px', color: p.header }}>{data.name || 'Ad Soyad'}</h1>
        {data.title && <div style={{ fontSize: '14px', fontWeight: 600, color: p.accent, marginBottom: '6px' }}>{data.title}</div>}
        <div style={{ fontSize: '12px', color: '#333' }}>
          {[data.email, data.phone, data.location, data.linkedin].filter(Boolean).join('  |  ')}
        </div>
      </div>

      {data.summary && (<><S title="Summary" /><div style={{ textAlign: 'justify', color: '#333' }}>{data.summary}</div></>)}

      {data.experience?.length > 0 && (
        <><S title="Experience" />
        {data.experience.map((e,i)=>(
          <div key={i} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>{e.role}{e.company ? `, ${e.company}` : ''}</div>
              {e.period && <div style={{ fontSize: '12px', fontWeight: 600 }}>{e.period}</div>}
            </div>
            {e.desc && <div style={{ marginTop: '4px', color: '#444' }}>{e.desc}</div>}
          </div>
        ))}</>
      )}

      {data.education?.length > 0 && (
        <><S title="Education" />
        {data.education.map((e,i)=>(
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div><span style={{ fontWeight: 700, color: '#111' }}>{e.school}</span>{e.degree ? `, ${e.degree}` : ''}</div>
            {e.period && <div style={{ fontSize: '12px', fontWeight: 600 }}>{e.period}</div>}
          </div>
        ))}</>
      )}

      {data.projects?.length > 0 && (
        <><S title="Projects" />
        {data.projects.map((proj,i)=>(
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 700, color: '#111' }}>{proj.name}{proj.link ? ` (${proj.link})` : ''}</div>
            {proj.desc && <div style={{ color: '#444', marginTop: '2px' }}>{proj.desc}</div>}
          </div>
        ))}</>
      )}

      {data.skills?.length > 0 && (<><S title="Skills" /><div style={{ color: '#333' }}><strong>Technical:</strong> {data.skills.join(', ')}</div></>)}
      {data.languages?.filter(l=>l).length > 0 && (<><S title="Languages" /><div style={{ color: '#333' }}>{data.languages.filter(l=>l).join(', ')}</div></>)}
      {data.certificates?.length > 0 && (<><S title="Certifications" /><div style={{ color: '#333' }}>{data.certificates.map(c => c.name).join(', ')}</div></>)}
    </div>
  )
}

// ─── LAYOUT 8: ATS Strict (Tümüyle Sola Dayalı, Flexbox'sız, %100 ATS Garantisi) ─
function LayoutAtsStrict({ data, p, f }) {
  const S = ({ title }) => (
    <div style={{ fontSize: '13px', fontWeight: 700, color: p.accent, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '20px', marginBottom: '8px', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>{title}</div>
  )
  return (
    <div style={{ fontFamily: f.family, padding: '44px 50px', color: '#111', fontSize: '12.5px', lineHeight: 1.55 }}>
      <div style={{ borderBottom: `2px solid ${p.line}`, paddingBottom: '14px', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0', color: p.header }}>{data.name || 'Ad Soyad'}</h1>
        {data.title && <div style={{ fontSize: '14px', fontWeight: 600, color: p.accent, margin: '0 0 8px 0' }}>{data.title}</div>}
        <div style={{ fontSize: '12px', color: '#444', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {[data.email, data.phone, data.location, data.linkedin].filter(Boolean).map((text, i) => (
            <div key={i}>{text}</div>
          ))}
        </div>
      </div>

      {data.summary && (<><S title="Summary" /><div style={{ color: '#333' }}>{data.summary}</div></>)}

      {data.experience?.length > 0 && (
        <><S title="Experience" />
        {data.experience.map((e,i)=>(
          <div key={i} style={{ marginBottom: '14px' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#111' }}>{e.role}</div>
            <div style={{ fontWeight: 600, color: p.header }}>{e.company} {e.period ? `— ${e.period}` : ''}</div>
            {e.desc && <div style={{ marginTop: '4px', color: '#444', marginLeft: '12px', textIndent: '-8px' }}>▪ {e.desc}</div>}
          </div>
        ))}</>
      )}

      {data.education?.length > 0 && (
        <><S title="Education" />
        {data.education.map((e,i)=>(
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 700, color: '#111' }}>{e.degree}</div>
            <div style={{ color: p.header }}>{e.school} {e.period ? `— ${e.period}` : ''}</div>
          </div>
        ))}</>
      )}

      {data.projects?.length > 0 && (
        <><S title="Projects" />
        {data.projects.map((proj,i)=>(
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 700, color: '#111' }}>{proj.name} {proj.link ? `| ${proj.link}` : ''}</div>
            {proj.desc && <div style={{ color: '#444', marginTop: '2px', marginLeft: '12px', textIndent: '-8px' }}>▪ {proj.desc}</div>}
          </div>
        ))}</>
      )}

      {data.skills?.length > 0 && (<><S title="Technical Skills" /><div style={{ color: '#333' }}>{data.skills.join(' • ')}</div></>)}
      {data.languages?.filter(l=>l).length > 0 && (<><S title="Languages" /><div style={{ color: '#333' }}>{data.languages.filter(l=>l).join(' • ')}</div></>)}
      {data.certificates?.length > 0 && (<><S title="Certifications" /><div style={{ color: '#333' }}>{data.certificates.map(c => c.name).join(' • ')}</div></>)}
    </div>
  )
}
