# CVCraft — Full-Stack CV Builder SaaS

AI destekli, modern CV oluşturucu. 60+ profesyonel şablon, çoklu dil desteği, ATS uyumluluk analizi ve Stripe ödeme entegrasyonu.

## 🛠 Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18 + Vite |
| Backend | Java 17 + Spring Boot 3.2 |
| Veritabanı | PostgreSQL 15 |
| Auth | JWT (Access + Refresh Token) + Google OAuth |
| Ödeme | Stripe (Subscription + One-time) |
| AI | Gemini API |
| i18n | TR / EN çoklu dil desteği |
| Container | Docker + Docker Compose |

## 📁 Proje Yapısı

```
cvcraft/
├── frontend/                  # React uygulaması
│   ├── src/
│   │   ├── components/cv/     # CV şablon bileşenleri (60+)
│   │   ├── pages/             # Auth, Dashboard, Editor, Templates
│   │   ├── i18n/              # Çoklu dil çevirileri (TR/EN)
│   │   ├── services/          # API çağrıları (axios)
│   │   └── store/             # Global state (Zustand)
│   └── package.json
│
├── backend/                   # Spring Boot uygulaması
│   └── src/main/java/com/cvcraft/
│       ├── controller/        # REST API endpoint'leri
│       ├── service/           # İş mantığı (AI, PDF, Stripe)
│       ├── repository/        # JPA repository'leri
│       ├── model/
│       │   ├── entity/        # JPA entity'leri (User, Cv)
│       │   ├── dto/           # Request/Response DTO'ları
│       │   └── enums/         # Enum tipleri
│       ├── security/          # JWT Filter + Token Provider
│       ├── config/            # Security, CORS, WebClient
│       └── exception/         # Global hata yönetimi
│
└── docker-compose.yml         # Tüm servisleri başlatır
```

## 🚀 Kurulum

### Gereksinimler
- Docker & Docker Compose
- Java 17+
- Node.js 18+
- PostgreSQL 15+

### 1. Repo'yu Klonla

```bash
git clone https://github.com/YOUR_USERNAME/cvcraft.git
cd cvcraft
```

### 2. Backend Konfigürasyonu

```bash
# application.yml.example dosyasını kopyala
cp cvcraft/backend/src/main/resources/application.yml.example \
   cvcraft/backend/src/main/resources/application.yml

# Kendi API key'lerinizi application.yml'e yazın:
# - Stripe secret key & webhook secret
# - Gemini API key
# - Google OAuth client ID
# - PostgreSQL şifresi
# - JWT secret (min 256-bit)
```

### 3. Frontend Environment

```bash
# frontend/.env (opsiyonel — varsayılan değerler çalışır)
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 4. Docker ile Başlat

```bash
cd cvcraft
docker-compose up -d
```

### 5. Manuel Başlatma (Geliştirme)

```bash
# PostgreSQL başlat
docker-compose up -d postgres

# Backend
cd backend
./mvnw spring-boot:run

# Frontend (ayrı terminal)
cd frontend
npm install
npm run dev
```

Uygulama: `http://localhost:5173`

## 📡 API Endpoints

### Auth
| Method | URL | Açıklama |
|--------|-----|----------|
| POST | `/api/auth/register` | Kayıt ol |
| POST | `/api/auth/login` | Giriş yap |
| POST | `/api/auth/refresh` | Token yenile |
| POST | `/api/auth/google` | Google OAuth |

### CV
| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api/cvs` | Kullanıcının CV'leri |
| POST | `/api/cvs` | Yeni CV oluştur |
| GET | `/api/cvs/{id}` | CV detayı |
| PUT | `/api/cvs/{id}` | CV güncelle |
| DELETE | `/api/cvs/{id}` | CV sil |
| POST | `/api/cvs/{id}/duplicate` | CV kopyala |
| POST | `/api/cvs/{id}/pdf-html` | HTML'den PDF oluştur |
| GET | `/api/cvs/{id}/pdf` | PDF export |

### Ödeme
| Method | URL | Açıklama |
|--------|-----|----------|
| POST | `/api/payment/checkout/subscription` | Aylık abonelik başlat |
| POST | `/api/payment/checkout/one-time` | Tek seferlik PDF satın al |
| POST | `/api/payment/webhook` | Stripe webhook |
| GET | `/api/payment/status` | Abonelik durumu |
| POST | `/api/payment/verify-session` | Ödeme doğrula |
| POST | `/api/payment/cancel` | Aboneliği iptal et |

### AI
| Method | URL | Açıklama |
|--------|-----|----------|
| POST | `/api/ai/analyze` | CV AI analizi (Premium) |
| POST | `/api/ai/translate` | CV dil çevirisi |
| POST | `/api/ai/cover-letter` | Kapak mektubu oluştur (Premium) |
| POST | `/api/ai/job-match` | İş ilanı eşleştirme (Premium) |

## 💰 Freemium Model

- **Ücretsiz:** 3 CV, ücretsiz şablonlar, ATS analizi, CV çevirisi
- **Premium (₺149/ay):** Sınırsız CV, 60+ şablon, PDF export, AI analizi, kapak mektubu, iş eşleştirme
- **Tek Seferlik (₺29):** 1 PDF download hakkı

## 🔒 Güvenlik

- JWT tabanlı stateless auth (access + refresh token)
- Google OAuth 2.0 entegrasyonu (ID token doğrulama)
- BCrypt şifre hashleme
- CORS whitelist (sadece frontend origin)
- Stripe webhook imza doğrulama
- Input validation & XSS koruması
- Replay attack koruması (payment session)

## 📋 Lisans

MIT
