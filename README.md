# 💰 Aplikasi Manajemen Keuangan Personal (Pro)

Aplikasi *Full-Stack* manajemen kelas *Enterprise* yang dirancang khusus untuk memonitor, mengaudit, dan menyimulasikan seluruh aspek keuangan pribadi Anda. Dibangun dengan ekosistem modern **Next.js 14**, **Turborepo**, **Tailwind CSS**, **Supabase**, dan **React Native (Expo)**.

Aplikasi ini mengonversi perhitungan rumit dari 3 formulasi Excel terpisah (*Financial Checkup*, Kalkulator KPR, dan Modul Budgeting Zero-Based) menjadi sebuah platform *Web App* dan *Mobile App* yang intuitif.

---

## 📁 Struktur Project (Turborepo)

```
app-keuangan/
├── apps/
│   ├── web/                    # Next.js 14 Web App
│   └── mobile/                 # React Native + Expo
├── packages/
│   └── shared/                 # Shared formulas & types
├── supabase/migrations/        # Database schema
│   ├── 001_initial_schema.sql
│   ├── 002_seed_data.sql
│   └── 003_add_kpr_floating_phases.sql  # ⭐ NEW
└── package.json
```

---

## ✨ Fitur Utama Tersedia

### Web App (Next.js)
- **🔐 Autentikasi Super Aman:** Supabase Auth (Login, Register, Email Verification, Reset Password)
- **📊 Net Worth & Snapshot:** Tracking kekayaan bersih bulanan
- **💸 Manajemen Arus Kas:** Pendapatan vs Pengeluaran
- **🏥 Checkup Kesehatan Finansial:** 6 indikator (Likuiditas, Tabungan, Cicilan, Investasi, Biaya Hidup, Solvabilitas)
- **🏡 Simulator KPR:** 
  - ⭐ **Bunga Berjenjang (Tiered Floating Rates)** - Fase transisi sebelum cap rate
  - Detail Modal untuk melihat ringkasan simulasi tersimpan
  - Amortisasi table lengkap
- **✉️ Sistem Amplop Budgeting:** Zero-Based Budgeting
- **📅 Kalendar & Evaluasi Tahunan**
- **🌙 Dark Mode & Mobile Responsive**

### Mobile App (React Native + Expo)
- **🔐 Auth:** Login/Register dengan Supabase
- **📊 Dashboard:** Overview fitur
- **🏡 KPR Calculator:** 
  - Form lengkap dengan toggle bunga berjenjang
  - Hitung cicilan min/max
  - Simpan simulasi ke cloud
- **📋 KPR List:** Daftar simulasi tersimpan (pull-to-refresh, delete)
- **📄 KPR Detail:** Detail lengkap simulasi

---

## 🛠️ Setup Development

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Supabase account

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd app-keuangan
pnpm install
```

### 2. Environment Variables

**Web (`apps/web/.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```

**Mobile (`apps/mobile/.env`):**
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```

### 3. Database Setup
1. Buat project di [Supabase](https://supabase.com)
2. Buka SQL Editor
3. Jalankan migration secara berurutan:
   - `001_initial_schema.sql`
   - `002_seed_data.sql` (opsional)
   - `003_add_kpr_floating_phases.sql` ⭐ **WAJIB untuk fitur KPR Berjenjang**

### 4. Run Development

**Web:**
```bash
pnpm dev:web
# atau
cd apps/web && pnpm dev
```

**Mobile:**
```bash
pnpm dev:mobile
# atau
cd apps/mobile && pnpm dev
```

---

## 🚀 Deployment

### Web (Vercel)
1. Push ke GitHub
2. Import ke [Vercel](https://vercel.com)
3. Set Environment Variables
4. Deploy!

### Mobile (Expo EAS)
```bash
cd apps/mobile

# Login
eas login

# Build APK Android
eas build -p android --profile preview

# Build IPA iOS
eas build -p ios --profile preview
```

---

## 🆕 Update Terbaru (April 2026)

### KPR Berjenjang (Tiered Floating Rates)
Fitur baru untuk simulasi KPR dengan struktur bunga:
- **Fix Rate** (contoh: 3.47% untuk 4 tahun)
- **Fase Transisi** (contoh: 8% untuk 2 tahun, 10% untuk 2 tahun)
- **Floating Cap** (contoh: 12.99% sisa tenor)

### Simulation Detail Modal
Klik icon 👁️ di simulasi tersimpan untuk melihat:
- Tanggal pembuatan
- Struktur bunga lengkap
- Cicilan min/max
- Total bunga
- Rasio cicilan/gaji

### Mobile App v1.0
Aplikasi mobile dengan React Native + Expo:
- Auth screens
- KPR Calculator
- List & Detail simulasi
- Reuse shared formulas dari web

---

## 📱 Screenshot

| Web - KPR Calculator | Web - Detail Modal | Mobile - KPR |
|---------------------|-------------------|--------------|
| ![Web KPR]() | ![Detail]() | ![Mobile]() |

---

## 🧪 Testing Checklist

- [ ] Login/Register web & mobile
- [ ] KPR Single Float calculation
- [ ] KPR Bunga Berjenjang calculation
- [ ] Simpan & load simulasi
- [ ] Detail modal menampilkan data lengkap
- [ ] Mobile KPR calculator hasil sama dengan web

---

## 📄 License

MIT License - Free to use and modify.

---

*Dibangun dengan ❤️ untuk membebaskan Anda dari belenggu Excel.*
