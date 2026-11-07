# QA Test Plan & Checklist — Web Portfolio Adhika

> **Dokumen ini disusun berdasarkan audit langsung terhadap source code repository `web-portofolio`.**
> Seluruh test case dirancang agar bisa dieksekusi apa adanya oleh tim developer/QA.

| Item | Keterangan |
|---|---|
| **Nama Produk** | Adhika Dwiki Septian — Personal Portfolio Website |
| **Repository** | `D:\coding\web-portofolio` |
| **Target URL (asumsi)** | `https://adhika26.github.io/web-portofolio/` |
| **Stack** | Vite 8, Tailwind CSS 4, Vanilla JavaScript (ES Module), HTML partials, GitHub Pages |
| **Arsitektur** | Static Single Page Application (SPA), tanpa server/API/database |
| **Contact Form** | `mailto:` handler (tidak ada pengiriman ke server) |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 7 November 2026 |
| **Disusun oleh** | Senior QA Automation & Manual Engineer |
| **Status** | Ready for Execution |

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Scope & Arsitektur](#2-scope--arsitektur)
3. [Strategi Pengujian](#3-strategi-pengujian)
4. [Environment, Device & Tools](#4-environment-device--tools)
5. [Risk Matrix](#5-risk-matrix)
6. [Severity, Priority & Quality Gate](#6-severity-priority--quality-gate)
7. [FRONTEND — Test Suite](#7-frontend--test-suite)
8. [BACKEND — Test Suite (Blueprint v2)](#8-backend--test-suite-blueprint-v2)
9. [Test Data](#9-test-data)
10. [Checklist Eksekusi Rilis](#10-checklist-eksekusi-rilis)
11. [Automation Plan](#11-automation-plan)
12. [Temuan Awal dari Static Review](#12-temuan-awal-dari-static-review)
13. [Traceability Matrix](#13-traceability-matrix)
14. [Defect Report Template & Sign-off](#14-defect-report-template--sign-off)

---

## 1. Ringkasan Eksekutif

### 1.1 Kondisi Aktual Project

Berdasarkan pemeriksaan source code:

| Aspek | Fakta | Implikasi QA |
|---|---|---|
| Frontend | HTML partials di-inline oleh plugin Vite kustom (`html-partials`) | Perlu test build, bukan hanya `dev` |
| Styling | Tailwind CSS 4 + `src/style.css` (custom components) | Visual regression & konsistensi token |
| JavaScript | 7 modul interaktif di `src/main.js` | Functional + accessibility + edge case |
| Backend | **Tidak ada** | Semua API/Auth/DB berstatus **BLUEPRINT** |
| Database | **Tidak ada** | Tidak ada CRUD/injection surface saat ini |
| Form kontak | `window.location.href = mailto:...` | Tidak ada delivery guarantee; UX gagal senyap |
| Build output | HTML 43 KB, CSS 38 KB, JS 4.3 KB | Bundle JS/CSS sehat |
| Aset gambar | 1.21 MB + 852 KB + 104 KB (PNG) | Risiko performa terbesar |
| Deployment | `gh-pages -d dist`, `base: '/web-portofolio/'` | Wajib test di sub-path, bukan root |

### 1.2 Kesimpulan

- **Frontend test surface:** 10 modul, **103 skenario**.
- **Backend test surface:** 0 implementasi saat ini, **87 skenario** disiapkan sebagai acceptance criteria v2.
- **Risiko tertinggi:** gambar tidak dioptimasi (±2.1 MB), contact form tanpa feedback/backend, dan gap aksesibilitas (skip link, kontras, error form).
- **Rekomendasi quality gate:** rilis dinyatakan **GO** hanya jika seluruh **P0 = 100% Pass** dan **P1 ≥ 95% Pass**.

### 1.3 Modul yang Diuji

| # | Modul | File | Status | Fokus |
|---|---|---|---|---|
| 1 | Navbar & Mobile Menu | `src/sections/navbar.html` | ✅ Live | Functional, A11y, Responsive |
| 2 | Hero & Typing Effect | `src/sections/hero.html` | ✅ Live | Functional, Motion, CLS |
| 3 | Skills Filter | `src/sections/skills.html` | ✅ Live | Functional, State, A11y |
| 4 | Portfolio | `src/sections/portfolio.html` | ✅ Live | Content, Links, Image Perf |
| 5 | Certificates | `src/sections/certificates.html` | ✅ Live | Links, PDF, Content |
| 6 | Services | `src/sections/services.html` | ✅ Live | Visual, Content |
| 7 | Contact Form | `src/sections/contact.html` | ✅ Live | Validation, Security, UX |
| 8 | CV Dropdown | `navbar.html`, `hero.html` | ✅ Live | Functional, Keyboard |
| 9 | Footer | `src/sections/footer.html` | ✅ Live | Content, Links, Year |
| 10 | Build & Deployment | `vite.config.js`, `package.json` | ✅ Live | Integration, Compatibility |
| 11 | Contact API | *belum ada* | 🔶 Blueprint | API, Security, Reliability |
| 12 | Admin/Auth | *belum ada* | 🔶 Blueprint | AuthN, AuthZ, RBAC |

---

## 2. Scope & Arsitektur

### 2.1 In Scope

- Seluruh halaman single-page: `#home`, `#skills`, `#portfolio`, `#certificates`, `#services`, `#contact`.
- Semua interaksi JavaScript: mobile menu, CV dropdown, skill filter, typing effect, scroll reveal, footer year, contact form.
- Semua tautan internal, eksternal, PDF CV, dan PDF sertifikat.
- Build production (`npm run build`) dan preview (`npm run preview`).
- Aksesibilitas WCAG 2.2 Level AA.
- Core Web Vitals pada mobile & desktop.
- Security client-side (XSS via input, tabnabbing, mixed content, dependency audit).

### 2.2 Out of Scope (versi saat ini)

| Area | Alasan |
|---|---|
| API/HTTP status code | Tidak ada backend |
| JWT/Session/RBAC | Tidak ada autentikasi |
| Database CRUD/injection | Tidak ada database |
| Server timeout/rate limiting | Tidak ada server |
| Email deliverability | Form hanya membuka mail client pengguna |
| Load test backend | Tidak ada endpoint |

> **Catatan:** Section 8 tetap disediakan lengkap sebagai **blueprint** bila backend ditambahkan. Jangan mengeksekusi atau melaporkan hasilnya sebagai "Pass" sebelum implementasi ada.

### 2.3 Alur Kontak Saat Ini

```
User isi form
   ↓
HTML5 native validation (required, type=email)
   ↓
submit handler: preventDefault()
   ↓
trim name/email/message
   ↓
encodeURIComponent(subject, body)
   ↓
window.location.href = "mailto:adhikaseptian5@gmail.com?subject=...&body=..."
   ↓
Mail client pengguna terbuka (atau TIDAK terjadi apa-apa jika tidak ada handler)
```

**Titik risiko:** tidak ada state loading/success/error, tidak ada batas panjang pesan, tidak ada penyimpanan pesan, dan tidak ada bukti pengiriman.

---

## 3. Strategi Pengujian

### 3.1 Level & Jenis

| Level | Pendekatan | Cakupan |
|---|---|---|
| Static Review | Baca source, validasi HTML, lint | Semua file |
| Unit/Component | Vitest + jsdom (setup baru) | Fungsi filter, formatter, validasi |
| Integration | Vite build + preview | Inline partials, asset path, base path |
| E2E | Playwright | Semua flow interaktif |
| Visual | Playwright screenshot / Percy | 3 breakpoint utama |
| Accessibility | axe-core + manual screen reader | WCAG 2.2 AA |
| Performance | Lighthouse CI + WebPageTest | Core Web Vitals |
| Security | OWASP checklist + `npm audit` | Client-side |
| Compatibility | BrowserStack / device fisik | 4 browser × 3 form factor |
| Regression | Full suite sebelum deploy | Seluruh P0/P1 |

### 3.2 Teknik

- **Positive testing:** happy path setiap fitur.
- **Negative testing:** input invalid, state kosong, resource gagal, JS gagal, network lambat.
- **Boundary value analysis:** panjang input 0, 1, max-1, max, max+1.
- **Equivalence partitioning:** email valid/invalid, role, kategori skill.
- **Exploratory testing:** 60 menit per rilis, fokus pada interaksi antar-komponen.
- **Risk-based prioritization:** P0 pada alur kontak, navigasi, dan render awal.

### 3.3 Urutan Eksekusi

1. Smoke test build production.
2. Functional P0 (navigasi, form, dropdown, filter).
3. Responsive + cross-browser.
4. Accessibility.
5. Performance.
6. Security & edge case.
7. Regression penuh + sign-off.

---

## 4. Environment, Device & Tools

### 4.1 Environment Matrix

| Env | URL/Command | Tujuan |
|---|---|---|
| Local Dev | `npm run dev` → `http://localhost:5173` | Debug cepat |
| Local Prod | `npm run build && npm run preview` | Validasi build & base path |
| Staging | GitHub Pages branch preview | UAT |
| Production | `https://adhika26.github.io/web-portofolio/` | Smoke test pasca-deploy |

### 4.2 Browser & Device

| Platform | Versi | Form Factor |
|---|---|---|
| Chrome | Latest & Latest-1 | Desktop, Android |
| Edge | Latest | Desktop |
| Firefox | Latest & ESR | Desktop |
| Safari | Latest (macOS) | Desktop |
| Safari iOS | Latest & Latest-1 | iPhone |
| Chrome Android | Latest | Android |
| Samsung Internet | Latest | Android |
| Viewport wajib | 320, 375, 390, 414, 768, 1024, 1280, 1440, 1920 px | — |

### 4.3 Network Profiles

| Profil | Down / Up / Latency | Dipakai untuk |
|---|---|---|
| Fast 3G | 1.6 Mbps / 750 Kbps / 150 ms | Mobile worst-case |
| Slow 4G | 4 Mbps / 3 Mbps / 80 ms | Mobile average |
| Cable | 5 Mbps / 1 Mbps / 28 ms | Desktop baseline |
| Offline | 0 | Resilience |
| High latency | 1 Mbps / 1 Mbps / 500 ms | Font/CDN failure |

### 4.4 Tools

| Kebutuhan | Tool |
|---|---|
| E2E & visual | Playwright |
| Unit | Vitest + jsdom |
| Accessibility | axe-core, Lighthouse, NVDA/VoiceOver |
| Performance | Lighthouse CI, WebPageTest, Chrome DevTools Performance |
| HTML validation | W3C Nu Html Checker, `html-validate` |
| Security | `npm audit`, OWASP ZAP (baseline), Snyk |
| Link checking | `lychee`, Playwright crawler |
| PDF validation | Manual + `pdfinfo` |
| Test management | GitHub Issues + Projects / Jira |
| CI | GitHub Actions |

### 4.5 Quick Start Eksekusi

```bash
npm ci
npm run dev          # functional harian
npm run build        # wajib sebelum QA rilis
npm run preview      # test base path /web-portofolio/
npm run deploy       # hanya setelah sign-off
```

---

## 5. Risk Matrix

| ID | Risiko | Likelihood | Impact | Level | Mitigasi |
|---|---|---|---|---|---|
| R-01 | Pesan kontak tidak terkirim karena `mailto:` tidak punya handler | High | High | **Critical** | Tambah API/Formspree + status feedback |
| R-02 | Gambar proyek 2.1 MB memperlambat LCP mobile | High | High | **High** | WebP/AVIF + `srcset` + resize |
| R-03 | Link/asset rusak setelah deploy sub-path GitHub Pages | Medium | High | **High** | Test `preview` + absolute base |
| R-04 | Kontras teks `zinc-500` gagal WCAG AA | High | Medium | **High** | Naikkan ke `zinc-400` |
| R-05 | Tidak ada skip link & error form tidak diumumkan | High | Medium | **High** | Skip link + `aria-live` + `aria-invalid` |
| R-06 | Input panjang memicu pemotongan URL `mailto:` | Medium | Medium | Medium | `maxlength` + counter + validasi |
| R-07 | Font Google gagal dimuat (jaringan/privacy) | Medium | Medium | Medium | Self-host font + `font-display` |
| R-08 | Tidak ada automated test/CI | High | Medium | **High** | Playwright + GitHub Actions |
| R-09 | Tidak ada security header (CSP, X-Frame-Options) | Medium | Medium | Medium | Meta CSP/CSP via host |
| R-10 | Metadata sosial (OG/Twitter) tidak ada | High | Low | Low | Tambah meta tag |

---

## 6. Severity, Priority & Quality Gate

### 6.1 Priority

| Kode | Arti | Contoh |
|---|---|---|
| **P0** | Blocker, wajib lulus | Halaman tidak render, form crash, link utama mati |
| **P1** | Critical, wajib lulus | Validasi gagal, menu mobile tidak bisa ditutup, PDF 404 |
| **P2** | Major, target lulus | Kontras gagal, CLS > 0.1, layout pecah di 320px |
| **P3** | Minor/improvement | Typo, animasi kurang halus |

### 6.2 Severity Defect

| Severity | Definisi | SLA Fix |
|---|---|---|
| S1 — Critical | Data loss, security breach, fitur inti tidak bisa dipakai | 24 jam |
| S2 — High | Fitur utama terganggu, tidak ada workaround | 3 hari |
| S3 — Medium | Fitur jalan tetapi UX/aksesibilitas terganggu | 7 hari |
| S4 — Low | Cosmetic/typo | Rilis berikutnya |

### 6.3 Entry Criteria

- Build production sukses tanpa error.
- Environment staging dapat diakses.
- Test data siap.
- Tidak ada blocker terbuka dari rilis sebelumnya.

### 6.4 Exit Criteria (Quality Gate)

| Gate | Target |
|---|---|
| P0 pass rate | 100% |
| P1 pass rate | ≥ 95% |
| P2 pass rate | ≥ 90% |
| S1/S2 open defect | 0 |
| Lighthouse Performance (mobile) | ≥ 85 |
| Lighthouse Accessibility | ≥ 95 |
| Axe critical/serious | 0 |
| LCP / INP / CLS | ≤ 2.5 s / ≤ 200 ms / ≤ 0.1 |
| Broken internal links | 0 |
| `npm audit` high/critical | 0 |

---

## 7. FRONTEND — Test Suite

**Legenda Jenis:** `F` Fungsional · `U` Usability · `S` Security · `P` Performance · `C` Compatibility · `A` Accessibility

### 7.1 Navigasi & Interaksi Umum (`FE-NAV`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| FE-NAV-01 | Page Load | **Positive:** Buka URL root. Verifikasi semua section (`#home`, `#skills`, `#portfolio`, `#certificates`, `#services`, `#contact`) ter-render dari partial. | F | P0 | Seluruh section tampil berurutan, tidak ada komentar `<!-- include:... -->` tersisa. |
| FE-NAV-02 | Anchor Nav | **Positive:** Klik setiap link navbar desktop. | F | P0 | Halaman scroll ke section yang benar, judul tidak tertutup navbar (scroll-margin 6.5rem). |
| FE-NAV-03 | Anchor Integrity | **Negative:** Cek setiap `href="#..."` terhadap `id` target. | F | P1 | 0 broken anchor; tidak ada scroll ke posisi salah. |
| FE-NAV-04 | Mobile Menu | **Positive:** Viewport < 1024px, klik tombol hamburger. | F | P0 | Menu muncul (`flex`), `aria-expanded="true"`, navbar berubah `rounded-2xl`. |
| FE-NAV-05 | Mobile Menu | **Positive:** Klik salah satu link di menu mobile. | F | P0 | Menu tertutup, `aria-expanded="false"`, halaman scroll ke target. |
| FE-NAV-06 | Mobile Menu | **Positive:** Tekan `Escape` saat menu terbuka. | F, A | P1 | Menu tertutup dan fokus kembali ke tombol hamburger. |
| FE-NAV-07 | Mobile Menu | **Positive:** Klik area di luar navbar. | F | P1 | Menu tertutup, state `aria-expanded` sinkron. |
| FE-NAV-08 | Mobile Menu | **Negative:** Buka menu, lalu resize ke desktop (>1024px), lalu kembali ke mobile. | C | P2 | Menu tersembunyi di desktop; state tidak korup saat kembali ke mobile. |
| FE-NAV-09 | Mobile Menu | **Negative:** Klik hamburger berulang cepat (double/triple click). | F | P2 | State toggle konsisten, tidak ada menu "setengah terbuka". |
| FE-NAV-10 | CV Dropdown | **Positive:** Klik tombol CV di navbar. | F | P0 | Menu muncul, `aria-expanded="true"`, chevron berputar 180°. |
| FE-NAV-11 | CV Dropdown | **Positive:** Buka dropdown hero, lalu buka dropdown navbar. | F | P1 | Hanya satu dropdown terbuka; dropdown lain otomatis tertutup. |
| FE-NAV-12 | CV Dropdown | **Positive:** Tekan `Escape` saat fokus di dalam dropdown. | F, A | P1 | Dropdown tertutup dan fokus kembali ke tombol toggle. |
| FE-NAV-13 | CV Dropdown | **Negative:** Klik di luar dropdown. | F | P2 | Dropdown tertutup tanpa mengganggu elemen lain. |
| FE-NAV-14 | CV Links | **Positive:** Klik "Bahasa Indonesia" dan "English". | F | P0 | `cv-id.pdf` / `cv-en.pdf` terbuka di tab baru, bukan 404, `rel="noopener noreferrer"` aktif. |
| FE-NAV-15 | Skill Filter | **Positive:** Klik tab "Frontend". | F | P0 | Hanya card `data-category="frontend"` tampil; tab aktif kuning; `aria-pressed="true"` hanya pada tab tersebut. |
| FE-NAV-16 | Skill Filter | **Positive:** Klik "Backend", "Tools & Others", lalu "All". | F | P0 | Setiap filter menampilkan subset yang tepat; "All" mengembalikan 8 card. |
| FE-NAV-17 | Skill Filter | **Negative:** Klik tab yang sama berulang kali. | F | P2 | Tidak ada card hilang/duplikat; state tetap idempoten. |
| FE-NAV-18 | Typing Effect | **Positive:** Amati teks `#typed-text` selama 15 detik. | F, U | P1 | Bergantian 3 role, hapus-tulis berjalan, tidak ada teks terpotong permanen. |
| FE-NAV-19 | Typing Effect | **Negative:** Aktifkan `prefers-reduced-motion: reduce`, reload. | A, U | P1 | Teks langsung menampilkan role pertama, tanpa animasi; layout tidak bergeser. |
| FE-NAV-20 | Scroll Reveal | **Positive:** Scroll dari atas ke bawah. | F, U | P2 | Card muncul halus (`is-visible`), tidak ada elemen yang tetap `opacity: 0`. |
| FE-NAV-21 | Scroll Reveal | **Negative:** Jalankan dengan JavaScript dimatikan. | C, F | P1 | Semua konten tetap terlihat (tanpa class `reveal`), tidak ada halaman kosong. |
| FE-NAV-22 | Footer Year | **Positive:** Cek teks copyright. | F | P2 | Tahun mengikuti `new Date().getFullYear()` (2026), fallback statis benar. |
| FE-NAV-23 | Footer Links | **Positive:** Klik GitHub, Email, dan "Back to top". | F | P1 | GitHub terbuka tab baru; mail client terbuka; halaman kembali ke `#home`. |
| FE-NAV-24 | Hash Load | **Positive:** Buka URL langsung dengan `#certificates` dan `#contact`. | F, C | P1 | Halaman load lalu scroll ke section target dengan offset benar. |

### 7.2 Responsivitas (`FE-RES`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| FE-RES-01 | Layout 320px | **Negative:** iPhone SE / viewport 320×568. | C, U | P0 | Tidak ada horizontal scroll; semua teks terbaca; tombol tidak terpotong. |
| FE-RES-02 | Layout 375px | **Positive:** 375×667. | C, U | P1 | Grid 2 kolom skills rapi; hero CTA tidak overflow. |
| FE-RES-03 | Layout 390px | **Positive:** 390×844. | C, U | P1 | Navbar 92% width, menu mobile berfungsi. |
| FE-RES-04 | Layout 768px | **Positive:** Tablet portrait. | C, U | P1 | Hero 2 kolom atau stack sesuai breakpoint `md`; tidak ada elemen bertumpuk. |
| FE-RES-05 | Layout 1024px | **Positive:** Tablet landscape / small laptop. | C, U | P1 | Menu desktop muncul di `lg`; hamburger hilang; konten tidak sempit. |
| FE-RES-06 | Layout 1280–1920px | **Positive:** Desktop lebar. | C, U | P2 | Container `max-w-6xl` center, tidak ada stretching berlebihan. |
| FE-RES-07 | Orientation | **Negative:** Rotate portrait ↔ landscape saat menu terbuka. | C | P2 | Layout menyesuaikan, menu tidak keluar viewport. |
| FE-RES-08 | Zoom 200% | **Negative:** Browser zoom 200% pada 1280px. | A, C | P1 | Konten reflow tanpa horizontal scroll; tidak ada teks terpotong. |
| FE-RES-09 | Long Content | **Negative:** Isi form dengan teks sangat panjang; cek hero/section. | U | P2 | Textarea scroll internal, card tidak melebar keluar grid. |
| FE-RES-10 | Short Height | **Negative:** Landscape 667×375. | C | P2 | Hero dapat di-scroll; CTA dan navbar tetap dapat dijangkau. |
| FE-RES-11 | Touch Targets | **Negative:** Ukur semua tombol/link di mobile. | A, U | P1 | Target ≥ 44×44 CSS px (nav 44px, skill tab 44px, footer link 44px). |
| FE-RES-12 | Overflow Audit | **Negative:** Jalankan `document.documentElement.scrollWidth > clientWidth` di semua breakpoint. | C | P1 | Bernilai `false` (tidak ada overflow horizontal). |

### 7.3 Cross-Browser & Compatibility (`FE-CB`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| FE-CB-01 | Chrome | Jalankan smoke + seluruh flow interaktif. | C | P0 | Semua fitur berfungsi, visual sesuai desain. |
| FE-CB-02 | Edge | Ulangi smoke test. | C | P1 | Tidak ada perbedaan layout/fungsi signifikan. |
| FE-CB-03 | Firefox | Ulangi smoke test; cek `backdrop-filter`, `mask-image`. | C | P1 | Efek visual degrade gracefully; konten tetap terbaca. |
| FE-CB-04 | Safari macOS | Cek font, blur, backdrop, PDF preview. | C | P1 | Tidak ada teks hilang; PDF terbuka. |
| FE-CB-05 | Safari iOS | Cek 100vh, safe area, sticky nav, input focus zoom. | C | P0 | Hero tidak terpotong; input tidak memicu zoom tak diinginkan (font ≥16px atau strategi setara). |
| FE-CB-06 | Chrome Android | Cek tap target, keyboard, mailto intent. | C | P1 | Menu dan form dapat dipakai satu tangan. |
| FE-CB-07 | Samsung Internet | Smoke test. | C | P2 | Tidak ada crash/blank screen. |
| FE-CB-08 | Font Blocked | **Negative:** Blokir `fonts.googleapis.com` / `fonts.gstatic.com`. | C, P | P1 | Fallback `system-ui` dipakai; tidak ada layout shift ekstrem; teks tetap terbaca. |
| FE-CB-09 | JS Disabled | **Negative:** Nonaktifkan JavaScript. | C, F | P1 | Konten inti tetap tampil; menu mobile tidak bisa dibuka (dokumentasikan sebagai limitasi). |
| FE-CB-10 | Slow Network | **Negative:** Fast 3G, cache kosong. | P, C | P1 | Halaman tetap dapat digunakan; tidak ada blank screen > 5 detik. |

### 7.4 Form Validation & Input Handling (`FE-FRM`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| FE-FRM-01 | Submit Valid | **Positive:** Isi nama, email valid, pesan; klik Send. | F | P0 | `mailto:` terbuka dengan subject `Portfolio contact from <nama>` dan body berisi nama, email, pesan. |
| FE-FRM-02 | Encoding | **Positive:** Isi `&`, `?`, `#`, `=`, spasi, newline. | F, S | P0 | Semua karakter ter-encode benar; tidak ada parameter terpotong/tercampur. |
| FE-FRM-03 | Trim | **Positive:** Isi nama/email/pesan dengan spasi depan-belakang. | F | P2 | Nilai di subject/body sudah ter-trim. |
| FE-FRM-04 | Empty Fields | **Negative:** Submit form kosong. | F | P0 | Submit diblokir; browser menandai ketiga field `required`; tidak ada mailto. |
| FE-FRM-05 | Invalid Email | **Negative:** `abc`, `abc@`, `@domain.com`, `a b@c.com`, `a@b`. | F | P0 | Submit diblokir oleh validasi `type="email"`; mailto tidak terbuka. |
| FE-FRM-06 | Valid Email Edge | **Positive:** `user+tag@sub.domain.co.id`, `USER@DOMAIN.COM`. | F | P1 | Diterima; mailto berisi alamat persis seperti input. |
| FE-FRM-07 | Whitespace Only | **Negative:** Isi ketiga field dengan spasi saja. | F | P1 | Tidak lolos sebagai konten valid; minimal tidak mengirim body kosong. |
| FE-FRM-08 | Email with Spaces | **Negative:** `" adhika@mail.com "` (spasi di awal/akhir). | F | P1 | Perilaku jelas & konsisten: ditolak atau di-trim sebelum validasi. Tidak boleh lolos ke mailto dengan spasi. |
| FE-FRM-09 | Max Length | **Negative:** Pesan 2.000 / 5.000 / 10.000 karakter. | F, U | P1 | Ada batas jelas (`maxlength`) atau pesan peringatan; tidak ada pemotongan senyap oleh batas URL mail client. |
| FE-FRM-10 | Special Chars | **Negative:** Nama berisi `<script>alert(1)</script>`, `"`, `'`, `\n`. | S | P0 | Tidak ada eksekusi script; karakter tampil/ter-encode sebagai teks di body email. |
| FE-FRM-11 | Header Injection | **Negative:** Email berisi `test@x.com%0ABcc:evil@x.com` dan newline. | S | P0 | Tidak ada header tambahan yang terbentuk; alamat tidak valid ditolak. |
| FE-FRM-12 | Unicode / Emoji | **Positive:** Nama `Adhika 🚀`, pesan bahasa Indonesia + emoji. | F | P2 | Ter-encode dan tampil utuh di mail client. |
| FE-FRM-13 | No Mail Handler | **Negative:** Jalankan di environment tanpa default mail client. | U, F | P1 | Tidak terjadi navigasi; **idealnya** muncul pesan/fallback (mis. tampilkan alamat email). Saat ini kemungkinan gagal senyap — catat defect. |
| FE-FRM-14 | Double Submit | **Negative:** Klik Send dua kali cepat. | U | P2 | Hanya satu mailto yang dipicu; tidak ada duplikasi berlebihan. |
| FE-FRM-15 | Keyboard Submit | **Positive:** Isi form, tekan `Tab` ke tombol, `Enter`. | A, F | P1 | Form tersubmit sama seperti klik mouse. |
| FE-FRM-16 | Autocomplete | **Positive:** Cek `autocomplete="name"` dan `autocomplete="email"`. | U | P2 | Browser menawarkan autofill nama/email. |
| FE-FRM-17 | Paste Long Text | **Negative:** Paste 20 KB teks dari clipboard. | U, F | P2 | UI tetap responsif; textarea dapat di-scroll; tidak freeze. |
| FE-FRM-18 | Native Message | **Negative:** Trigger validasi di Chrome/Firefox/Safari. | C, U | P2 | Pesan validasi muncul dan dapat dipahami; bahasa mengikuti locale browser. |

### 7.5 UI/UX, Visual & Konten (`FE-UI`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| FE-UI-01 | Visual Baseline | Bandingkan halaman dengan desain/referensi pada 3 breakpoint. | U | P1 | Spacing, warna, radius, shadow konsisten. |
| FE-UI-02 | Typography | Cek heading, body, label, footer. | U | P2 | Hierarki jelas; tidak ada font fallback tak terduga; tidak ada teks terpotong. |
| FE-UI-03 | Color System | Cek accent kuning, background, border. | U | P2 | Tidak ada warna di luar token; dark theme konsisten. |
| FE-UI-04 | Internal Links | Crawl semua `href="#..."` dan link internal. | F | P0 | 0 broken link/anchor. |
| FE-UI-05 | External Links | Klik GitHub, LinkedIn, 3 repo proyek. | F, S | P1 | Semua 200; `target="_blank"` disertai `rel="noopener noreferrer"`. |
| FE-UI-06 | PDF Certificates | Buka 4 sertifikat. | F | P0 | Semua PDF terbuka, nama file cocok, bukan 404. |
| FE-UI-07 | PDF CV | Buka CV ID & EN. | F | P0 | Kedua PDF valid dan dapat diunduh/dibuka. |
| FE-UI-08 | Images | Cek 3 gambar proyek. | F | P1 | Semua load, rasio 16:10 benar, tidak stretched/blur. |
| FE-UI-09 | Alt Text | Cek `alt` setiap gambar. | A | P1 | Alt deskriptif, bukan nama file; gambar dekoratif `alt=""`/`aria-hidden`. |
| FE-UI-10 | Hover States | Hover card, tombol, link. | U | P2 | Perubahan warna/shadow halus, tidak ada flicker. |
| FE-UI-11 | Focus States | Tab melalui semua elemen interaktif. | A | P1 | Outline kuning 2px terlihat di semua elemen. |
| FE-UI-12 | Content Accuracy | Cocokkan metrik proyek, tahun, issuer sertifikat, social handle. | U | P1 | Tidak ada data usang/salah ketik (contoh: nama file `pyhton` perlu dicek konsistensinya). |
| FE-UI-13 | Footer | Cek alignment, copyright, tahun. | U | P2 | Rapi di mobile & desktop, tahun benar. |
| FE-UI-14 | Empty States | **Negative:** Blokir gambar (dev tools). | U, C | P2 | Alt text tampil; layout tidak kolaps total. |
| FE-UI-15 | Print | **Negative:** Print preview / simpan PDF. | U | P3 | Konten terbaca; background gelap tidak menghabiskan tinta berlebihan (opsional). |

### 7.6 Accessibility / WCAG 2.2 AA (`FE-A11Y`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| FE-A11Y-01 | Axe Scan | Jalankan axe-core pada halaman penuh. | A | P0 | 0 critical, 0 serious. |
| FE-A11Y-02 | Skip Link | **Negative:** Tab pertama setelah load. | A | P1 | Fokus masuk ke "Skip to content" yang terlihat. *Saat ini belum ada — defect.* |
| FE-A11Y-03 | Landmarks | Cek `<nav>`, `<main>`, `<footer>`, section berlabel. | A | P1 | Struktur landmark valid; hanya satu `<main>`. |
| FE-A11Y-04 | Heading Order | Cek h1→h2→h3. | A | P1 | Tepat satu `h1`; tidak ada level melompat. |
| FE-A11Y-05 | Keyboard Nav | Tab dari awal sampai akhir tanpa mouse. | A | P0 | Semua elemen interaktif dapat dijangkau; urutan logis; tidak ada focus trap. |
| FE-A11Y-06 | Dropdown Keyboard | Buka CV dropdown dengan `Enter`/`Space`, navigasi `Tab`, tutup `Escape`. | A | P1 | Dapat dioperasikan penuh dengan keyboard; fokus kembali ke toggle. |
| FE-A11Y-07 | Mobile Menu SR | Gunakan screen reader (NVDA/VoiceOver). | A | P1 | Nama tombol "Toggle menu" masuk akal; status expanded diumumkan. |
| FE-A11Y-08 | Form Labels | Cek `label[for]` untuk ketiga input. | A | P0 | Setiap input punya label terprogram; tidak hanya placeholder. |
| FE-A11Y-09 | Error Announcement | **Negative:** Submit invalid dengan screen reader. | A | P1 | Error diumumkan (`aria-live`/`aria-invalid` + `aria-describedby`). *Saat ini belum ada — defect.* |
| FE-A11Y-10 | Contrast Body | Ukur `text-zinc-500` pada `#050505` dan `#0d0d0d`. | A | P1 | Rasio ≥ 4.5:1 untuk teks normal. *Perhitungan ±4.0–4.1:1 — perlu fix.* |
| FE-A11Y-11 | Contrast Accent | Ukur kuning `#facc15` dan hitam di atasnya. | A | P2 | ≥ 4.5:1 (keduanya lolos). |
| FE-A11Y-12 | Focus Indicator | Ukur visibilitas ring fokus. | A | P1 | Indikator fokus ≥ 3:1 dan area cukup (WCAG 2.4.11). *Input form hanya border 1px + ring 12% — perlu verifikasi.* |
| FE-A11Y-13 | Reduced Motion | Emulasi `prefers-reduced-motion`. | A | P1 | Animasi reveal, blink, smooth scroll, dropdown dimatikan/dikurangi. |
| FE-A11Y-14 | Zoom/Reflow | 200% zoom dan 320px width. | A | P1 | Tidak ada kehilangan konten; reflow vertikal. |
| FE-A11Y-15 | Language | Cek atribut `lang`. | A | P2 | `lang="en"` konsisten dengan mayoritas konten; segmen Indonesia diberi `lang="id"`. *Saat ini campuran — defect.* |
| FE-A11Y-16 | Decorative SVG | Cek ikon dekoratif. | A | P2 | Ikon dekoratif `aria-hidden="true"` atau punya nama aksesibel. |
| FE-A11Y-17 | Target Size | Ukur target interaktif. | A | P1 | ≥ 24×24 (minimum 2.5.8) dan ideal ≥ 44×44. |

### 7.7 Performance Client-Side (`FE-PERF`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| FE-PERF-01 | Lighthouse Mobile | Jalankan Lighthouse mobile (throttled). | P | P0 | Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. |
| FE-PERF-02 | Lighthouse Desktop | Jalankan Lighthouse desktop. | P | P1 | Performance ≥ 95. |
| FE-PERF-03 | LCP | Ukur LCP mobile Fast 3G. | P | P0 | ≤ 2.5 s (target ideal ≤ 1.8 s). |
| FE-PERF-04 | INP | Ukur interaksi (menu, filter, submit). | P | P0 | ≤ 200 ms. |
| FE-PERF-05 | CLS | Ukur seluruh halaman saat load + scroll. | P | P0 | ≤ 0.1. |
| FE-PERF-06 | TTFB | Ukur response awal GitHub Pages. | P | P1 | ≤ 800 ms. |
| FE-PERF-07 | Initial Transfer | Ukur total byte initial load (cache kosong). | P | P1 | ≤ 1.5 MB (di luar PDF). Saat ini gambar proyek total ±2.1 MB meski lazy. |
| FE-PERF-08 | Bundle Size | Cek output build. | P | P2 | JS ≤ 50 KB, CSS ≤ 50 KB (saat ini 4.3 KB & 38.3 KB — baik). |
| FE-PERF-09 | Image Optimization | Audit format & dimensi gambar. | P | P0 | WebP/AVIF + `srcset`; tidak ada PNG 1.2 MB untuk 1280×800. |
| FE-PERF-10 | Lazy Loading | Cek 3 gambar proyek. | P | P2 | `loading="lazy"` + `decoding="async"` + `width`/`height` (sudah ada). |
| FE-PERF-11 | Font Loading | Ukur FOIT/FOUT. | P | P1 | `display=swap` aktif; teks segera tampil; CLS ≤ 0.1. |
| FE-PERF-12 | Render Blocking | Audit CSS/JS/font di critical path. | P | P1 | Tidak ada render-blocking berlebihan; font eksternal di-preconnect. |
| FE-PERF-13 | Main Thread | Rekam Performance panel saat typing + scroll. | P | P2 | Tidak ada long task > 50 ms berulang; animasi 60fps. |
| FE-PERF-14 | Caching | Cek header cache asset ber-hash. | P | P2 | Asset `immutable`/long cache; HTML no-cache. |
| FE-PERF-15 | Third-Party | Hitung request eksternal. | P | P2 | Hanya Google Fonts; tidak ada tracker tak perlu. |

### 7.8 SEO, Metadata & Deployment (`FE-SEO`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| FE-SEO-01 | Title & Description | Cek `<title>` dan meta description. | F | P1 | Unik, relevan, panjang wajar (≤ 60 / ≤ 160 karakter). |
| FE-SEO-02 | Open Graph | Cek `og:title`, `og:description`, `og:image`, `og:url`. | F | P2 | Lengkap; preview sosial tampil benar. *Saat ini belum ada.* |
| FE-SEO-03 | Twitter Card | Cek `twitter:card` dan image. | F | P3 | Preview card valid. |
| FE-SEO-04 | Canonical | Cek `<link rel="canonical">`. | F | P2 | Menunjuk URL produksi. |
| FE-SEO-05 | robots/sitemap | Cek `robots.txt` dan `sitemap.xml`. | F | P3 | Dapat diakses; tidak memblokir crawler. |
| FE-SEO-06 | Structured Data | Cek JSON-LD `Person`/`WebSite`. | F | P3 | Valid tanpa error di Rich Results Test. |
| FE-SEO-07 | 404 Handling | Buka URL tidak valid di GitHub Pages. | C, F | P2 | Halaman 404 jelas; ada jalan kembali ke home. |
| FE-SEO-08 | Base Path | Build produksi, akses via `/web-portofolio/`. | C, F | P0 | Semua asset, PDF, gambar, favicon load (tidak 404). |
| FE-SEO-09 | Deploy Artifact | Bandingkan `dist/` dengan source. | F | P1 | Partial ter-inline, tidak ada file `.html` section bocor, tidak ada `dist` usang. |

---

## 8. BACKEND — Test Suite (Blueprint v2)

> ### ⚠️ Status: BLUEPRINT — BELUM DIIMPLEMENTASI
>
> Repository ini **tidak memiliki backend, API, database, maupun autentikasi**. Seluruh test case di bawah adalah **acceptance criteria untuk versi 2** ketika contact API/admin panel ditambahkan. Jangan menandai "Pass" sebelum endpoint benar-benar ada.
>
> **Kontrak API yang diasumsikan:**
> - `GET /api/health`
> - `POST /api/contact`
> - `GET /api/projects`, `GET /api/projects/:slug`
> - `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`
> - `GET /api/admin/messages`, `PATCH /api/admin/messages/:id`, `DELETE /api/admin/messages/:id`
> - Role: `owner` (full), `editor` (read/update), `viewer` (read-only)

### 8.1 API Testing & HTTP Status Codes (`BE-API`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| BE-API-01 | Health Check | **Positive:** `GET /api/health`. | F | P0 | `200 OK`, body `{ status: "ok", version, uptime }`, response < 200 ms. |
| BE-API-02 | List Projects | **Positive:** `GET /api/projects?page=1&limit=10`. | F | P0 | `200`, array data + meta pagination, schema valid. |
| BE-API-03 | Detail Project | **Positive:** `GET /api/projects/angkringan-pos`. | F | P0 | `200`, data sesuai slug. |
| BE-API-04 | Detail Not Found | **Negative:** `GET /api/projects/tidak-ada`. | F | P1 | `404`, body error konsisten, tanpa stack trace. |
| BE-API-05 | Create Contact | **Positive:** `POST /api/contact` payload valid. | F | P0 | `201 Created`, `Location` header, body berisi `id`, data tersimpan. |
| BE-API-06 | Malformed JSON | **Negative:** Body `{name:` tanpa penutup. | F | P0 | `400 Bad Request`, pesan jelas, tidak crash. |
| BE-API-07 | Validation Error | **Negative:** Email `abc`, pesan kosong, nama 1 karakter. | F | P0 | `422 Unprocessable Entity`, `errors` per field. |
| BE-API-08 | Missing Content-Type | **Negative:** POST tanpa `Content-Type: application/json`. | F | P1 | `415 Unsupported Media Type` (atau `400` sesuai kontrak). |
| BE-API-09 | Payload Too Large | **Negative:** Body 2 MB. | F, S | P1 | `413 Payload Too Large`, koneksi ditutup aman. |
| BE-API-10 | Method Not Allowed | **Negative:** `DELETE /api/contact`. | F | P1 | `405 Method Not Allowed` + header `Allow`. |
| BE-API-11 | Duplicate Submit | **Negative:** Kirim payload identik 2× dalam 5 detik. | F | P2 | `409 Conflict` atau idempotent `200/201`; tidak ada duplikat DB. |
| BE-API-12 | Rate Limit | **Negative:** 20 request/menit dari satu IP. | S, P | P1 | `429 Too Many Requests` + `Retry-After`; tidak memblokir permanent. |
| BE-API-13 | Unauthorized | **Negative:** `GET /api/admin/messages` tanpa token. | S | P0 | `401 Unauthorized`, tanpa data. |
| BE-API-14 | Forbidden | **Negative:** Token `viewer` → `DELETE /api/admin/messages/1`. | S | P0 | `403 Forbidden`, data tidak berubah. |
| BE-API-15 | Server Error | **Negative:** Simulasikan exception DB. | F, S | P0 | `500 Internal Server Error`, body generik, error asli hanya di log. |
| BE-API-16 | Service Unavailable | **Negative:** Matikan DB/upstream. | F | P1 | `503 Service Unavailable` + `Retry-After`, health check gagal. |
| BE-API-17 | CORS | **Negative:** Preflight dari origin tidak diizinkan. | S | P1 | `403`/tanpa `Access-Control-Allow-Origin`; origin valid diizinkan eksplisit. |
| BE-API-18 | Content Negotiation | **Negative:** `Accept: application/xml`. | F | P3 | `406 Not Acceptable` atau tetap JSON sesuai kontrak. |
| BE-API-19 | Cache Headers | **Positive:** `GET /api/projects`. | P | P2 | `Cache-Control` & `ETag` benar; `304` saat conditional request. |
| BE-API-20 | Idempotency | **Positive:** `POST /api/contact` + `Idempotency-Key`. | F | P2 | Request ulang dengan key sama mengembalikan response pertama, tanpa duplikasi. |

### 8.2 Authentication & Session (`BE-AUTH`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| BE-AUTH-01 | Login Valid | **Positive:** Email/password benar. | F, S | P0 | `200`, access token (15 menit) + refresh token, `Set-Cookie` aman bila cookie-based. |
| BE-AUTH-02 | Wrong Password | **Negative:** Password salah. | S | P0 | `401`, pesan generik "Invalid credentials", timing seragam. |
| BE-AUTH-03 | Unknown Email | **Negative:** Email tidak terdaftar. | S | P0 | `401` dengan pesan & timing sama seperti wrong password (anti user enumeration). |
| BE-AUTH-04 | Brute Force | **Negative:** 10 login gagal berturut-turut. | S | P0 | Lockout sementara / `429`; tidak ada bypass dengan ganti `User-Agent`. |
| BE-AUTH-05 | Token Expired | **Negative:** Gunakan access token kedaluwarsa. | S | P0 | `401`, `WWW-Authenticate`, client diarahkan refresh/re-login. |
| BE-AUTH-06 | Signature Tampered | **Negative:** Ubah 1 karakter payload/signature JWT. | S | P0 | `401`, token ditolak. |
| BE-AUTH-07 | alg=none Attack | **Negative:** JWT `{"alg":"none"}`. | S | P0 | `401`, algoritma di-whitelist. |
| BE-AUTH-08 | Refresh Rotation | **Positive:** Refresh token dipakai sekali. | S | P0 | Token baru diterbitkan; token lama langsung invalid. |
| BE-AUTH-09 | Refresh Reuse | **Negative:** Pakai ulang refresh token lama. | S | P0 | `401` + seluruh family token dicabut (reuse detection). |
| BE-AUTH-10 | Logout | **Positive:** Logout lalu pakai token lama. | S | P0 | `204`, token masuk denylist/revoked; request berikutnya `401`. |
| BE-AUTH-11 | Cookie Flags | **Positive:** Inspeksi cookie sesi. | S | P0 | `HttpOnly`, `Secure`, `SameSite=Lax/Strict`, `Path=/`, tidak bocor ke subdomain. |
| BE-AUTH-12 | CSRF | **Negative:** POST state-changing tanpa CSRF token (cookie auth). | S | P0 | `403`; token divalidasi per-session. |
| BE-AUTH-13 | Session Fixation | **Negative:** Set session ID sebelum login. | S | P1 | ID dirotasi setelah login sukses. |
| BE-AUTH-14 | Password Reset | **Negative:** Token reset dipakai 2× / kedaluwarsa 15 menit. | S | P1 | Token single-use, expiry enforced, response tidak membocorkan keberadaan email. |
| BE-AUTH-15 | Password Policy | **Negative:** Password `123456`, `password`. | S | P2 | Ditolak dengan kebijakan jelas; hash Argon2id/bcrypt cost memadai. |
| BE-AUTH-16 | Concurrent Session | **Positive:** Login di 2 device. | F, S | P2 | Perilaku sesuai kebijakan (izinkan atau cabut sesi lama) dan terdokumentasi. |

### 8.3 Authorization & RBAC (`BE-RBAC`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| BE-RBAC-01 | Owner Access | **Positive:** Owner akses semua endpoint admin. | S, F | P0 | `200` untuk read/update/delete. |
| BE-RBAC-02 | Editor Access | **Negative:** Editor mencoba delete. | S | P0 | `403`; data tetap ada. |
| BE-RBAC-03 | Viewer Access | **Negative:** Viewer mencoba update. | S | P0 | `403`. |
| BE-RBAC-04 | Anonymous | **Negative:** Tanpa login ke endpoint admin. | S | P0 | `401`, tidak ada kebocoran schema/data. |
| BE-RBAC-05 | IDOR | **Negative:** Viewer mengakses `GET /api/admin/messages/<id-milik-user-lain>` dengan menebak ID. | S | P0 | `403`/`404`; bukan `200` dengan data orang lain. |
| BE-RBAC-06 | Horizontal Escalation | **Negative:** User A mengubah resource User B. | S | P0 | Ditolak; kepemilikan diverifikasi di server. |
| BE-RBAC-07 | Role Escalation | **Negative:** Payload update menyertakan `role: "owner"`. | S | P0 | Field `role` diabaikan/ditolak (mass assignment protection). |
| BE-RBAC-08 | JWT Claim Tamper | **Negative:** Ubah claim `role` di JWT tanpa signature valid. | S | P0 | `401`, signature diverifikasi sebelum otorisasi. |
| BE-RBAC-09 | UI Bypass | **Negative:** Panggil endpoint langsung meski tombol disembunyikan di UI. | S | P0 | Server tetap menolak; UI hiding bukan kontrol keamanan. |
| BE-RBAC-10 | 403 vs 404 | **Negative:** Akses resource yang tidak ada vs tidak berhak. | S | P2 | Konsisten: `404` untuk tidak ada, `403` untuk tidak berhak (atau `404` untuk keduanya bila anti-enumeration). |
| BE-RBAC-11 | Role Matrix | **Positive:** Uji seluruh kombinasi role × endpoint. | S | P1 | Matriks akses sesuai dokumen; tidak ada endpoint tanpa proteksi. |

### 8.4 Database & Data Integrity (`BE-DB`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| BE-DB-01 | Create | **Positive:** Insert contact valid. | F | P0 | Row tersimpan, `id` unik, `created_at` terisi UTC. |
| BE-DB-02 | Read | **Positive:** Query by `id` dan list. | F | P0 | Data konsisten dengan response API. |
| BE-DB-03 | Update | **Positive:** Update status pesan `new → read`. | F | P1 | Hanya field yang diizinkan berubah; `updated_at` naik. |
| BE-DB-04 | Delete | **Positive:** Soft delete pesan. | F | P1 | `deleted_at` terisi; tidak muncul di list; data masih ada untuk audit. |
| BE-DB-05 | Duplicate Email | **Negative:** Insert email yang sudah ada (jika unique). | F | P1 | `409`/constraint violation tertangani, bukan `500`. |
| BE-DB-06 | NOT NULL | **Negative:** Insert tanpa `email`. | F | P1 | Ditolak di DB + API `422`; tidak ada row setengah jadi. |
| BE-DB-07 | Max Length | **Negative:** Nama 10.000 karakter. | F | P1 | Ditolak `422`/`413`; tidak terpotong diam-diam. |
| BE-DB-08 | Transaction Rollback | **Negative:** Gagal di tengah multi-step insert. | F | P0 | Tidak ada partial write; rollback bersih. |
| BE-DB-09 | FK Constraint | **Negative:** Insert child dengan parent tidak ada. | F | P1 | Ditolak; pesan error jelas di log. |
| BE-DB-10 | Unicode | **Positive:** Emoji, aksara non-Latin, RTL. | F | P1 | Tersimpan dan kembali identik (UTF-8/utf8mb4). |
| BE-DB-11 | Timezone | **Positive:** Insert dari 2 zona waktu. | F | P2 | Disimpan UTC, ditampilkan sesuai TZ yang ditentukan. |
| BE-DB-12 | Pagination | **Negative:** `limit=0`, `limit=-1`, `limit=10000`, `page=-1`. | F, S | P1 | Divalidasi; `limit` dibatasi (mis. max 100); tidak ada full table scan. |
| BE-DB-13 | SQL Injection | **Negative:** `' OR '1'='1`, `'; DROP TABLE users;--`, `UNION SELECT`. | S | P0 | Parametrized query; input diperlakukan sebagai data; tidak ada kebocoran. |
| BE-DB-14 | NoSQL Injection | **Negative:** `{"$ne": null}`, `{"$gt": ""}` pada field login. | S | P0 | Tipe divalidasi; operator ditolak. |
| BE-DB-15 | Stored XSS | **Negative:** Simpan `<img src=x onerror=alert(1)>`. | S | P0 | Disimpan sebagai teks; di-escape saat render; tidak dieksekusi. |
| BE-DB-16 | Mass Assignment | **Negative:** Kirim field `is_admin`, `role`, `id`. | S | P0 | Field tidak dikenal ditolak/diabaikan. |
| BE-DB-17 | Concurrent Update | **Negative:** 2 update bersamaan pada row yang sama. | F | P2 | Optimistic locking/`version` mencegah lost update. |
| BE-DB-18 | Backup Restore | **Positive:** Restore backup ke staging. | F | P1 | Data utuh, constraint valid, aplikasi berjalan. |
| BE-DB-19 | PII Protection | **Positive:** Cek kolom email/IP. | S | P1 | Terenkripsi at-rest atau setidaknya akses dibatasi + redaksi di log. |
| BE-DB-20 | N+1 Query | **Negative:** List 100 pesan + relasi. | P | P2 | Jumlah query konstan; response < 500 ms. |

### 8.5 Error Handling, Reliability & Observability (`BE-ERR`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| BE-ERR-01 | 500 Sanitization | **Negative:** Paksa exception. | S | P0 | Response generik + `request_id`; stack trace tidak bocor. |
| BE-ERR-02 | Error Shape | **Positive:** Semua error mengikuti schema. | F | P1 | `{ error: { code, message, details? }, request_id }` konsisten. |
| BE-ERR-03 | Correlation ID | **Negative:** Kirim `X-Request-ID` lalu cek log. | F | P2 | ID sama muncul di response & log; jika tidak dikirim, server membuat. |
| BE-ERR-04 | Upstream Timeout | **Negative:** Upstream lambat 30 detik. | P | P1 | Timeout 5–10 detik, `504 Gateway Timeout`, tidak menggantung koneksi. |
| BE-ERR-05 | Retry Storm | **Negative:** Client retry agresif saat 500. | P | P1 | Backoff + jitter; server tidak tumbang. |
| BE-ERR-06 | Rate Limit Header | **Positive:** Cek `X-RateLimit-Limit/Remaining/Reset`. | P | P2 | Header akurat dan konsisten dengan 429. |
| BE-ERR-07 | Log Redaction | **Positive:** Kirim password/token di body. | S | P0 | Tidak muncul plaintext di log; dimasking. |
| BE-ERR-08 | Alerting | **Negative:** 10 error 500 dalam 1 menit. | F | P2 | Alert terkirim ke channel on-call. |
| BE-ERR-09 | Graceful Shutdown | **Negative:** Kirim SIGTERM saat request berjalan. | F | P1 | Request aktif diselesaikan; koneksi baru ditolak; tidak ada data corrupt. |
| BE-ERR-10 | Payload Bomb | **Negative:** JSON deeply nested 10.000 level. | S | P1 | Ditolak `400`/`413`; tidak stack overflow. |
| BE-ERR-11 | Slowloris | **Negative:** Koneksi lambat dalam jumlah banyak. | S, P | P2 | Timeout & connection limit aktif. |
| BE-ERR-12 | Dependency Down | **Negative:** DB/Redis mati. | F | P1 | `503`, health check `unhealthy`, aplikasi tidak crash loop. |
| BE-ERR-13 | Duplicate Request | **Negative:** Double-click submit. | F | P2 | Idempotency/unique constraint mencegah duplikasi. |
| BE-ERR-14 | Audit Trail | **Positive:** Update/delete oleh admin. | F, S | P2 | Tercatat siapa, kapan, perubahan apa. |

### 8.6 Security Headers & Platform (`BE-SEC`)

| ID | Modul / Fitur | Skenario Pengujian (Positive / Negative) | Jenis | Prioritas | Expected Result |
|---|---|---|---|---|---|
| BE-SEC-01 | Security Headers | Cek response header produksi. | S | P1 | `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`. |
| BE-SEC-02 | HSTS | Cek HTTPS. | S | P1 | `Strict-Transport-Security` aktif, HTTP redirect ke HTTPS. |
| BE-SEC-03 | Clickjacking | Coba iframe halaman. | S | P2 | Ditolak via `frame-ancestors`/`X-Frame-Options`. |
| BE-SEC-04 | TLS | Scan TLS. | S | P1 | TLS 1.2+, tidak ada cipher lemah, sertifikat valid. |
| BE-SEC-05 | Dependency Audit | `npm audit`. | S | P0 | 0 high/critical; dependabot aktif. |
| BE-SEC-06 | Secret Leak | Scan repo untuk API key/token. | S | P0 | Tidak ada secret ter-commit. |

---

## 9. Test Data

### 9.1 Form Kontak

| Kategori | Data | Ekspektasi |
|---|---|---|
| Valid | `Adhika Dwiki`, `adhika@example.com`, `Halo, saya tertarik bekerja sama.` | Lolos, mailto benar |
| Valid edge | `user+tag@sub.domain.co.id`, nama `Ådhi'ka "ADS"`, pesan emoji 🚀 | Lolos, encoding aman |
| Invalid email | `abc`, `abc@`, `@mail.com`, `a b@mail.com`, `a@b`, `a..b@mail.com` | Ditolak |
| Empty | `""`, `"   "` | Ditolak |
| XSS | `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>` | Tidak dieksekusi |
| Injection | `' OR 1=1--`, `{"$ne":null}`, `test@x.com%0ABcc:evil@x.com` | Tidak berdampak |
| Length | 0, 1, 254, 255, 256, 1.000, 5.000, 10.000 karakter | Dibatasi dengan pesan jelas |
| Unicode | `日本語`, `العربية`, `é`, `🚀🔥` | Utuh |

### 9.2 Viewport

`320×568`, `360×640`, `375×667`, `390×844`, `414×896`, `768×1024`, `1024×768`, `1280×800`, `1366×768`, `1440×900`, `1920×1080`, `2560×1440`.

### 9.3 Akun & Role (Blueprint)

| Role | Email | Hak |
|---|---|---|
| Owner | `owner@test.local` | Read, create, update, delete, manage users |
| Editor | `editor@test.local` | Read, update |
| Viewer | `viewer@test.local` | Read only |
| Anonymous | — | Tidak ada akses admin |

---

## 10. Checklist Eksekusi Rilis

> Centang setelah diverifikasi. Satu baris boleh merangkum beberapa test ID.

### 10.1 Pre-Release (Build & Deploy)

- [ ] `npm ci` bersih tanpa error
- [ ] `npm run build` sukses, tidak ada warning kritis
- [ ] `dist/index.html` berisi semua partial (tidak ada `<!-- include:`)
- [ ] Asset memakai base `/web-portofolio/` dan load di `preview`
- [ ] Semua PDF CV & sertifikat ada di `dist`
- [ ] `npm audit` 0 high/critical
- [ ] Smoke test production URL setelah deploy

### 10.2 Frontend Functional

- [ ] FE-NAV-01 s/d 03 — render & anchor
- [ ] FE-NAV-04 s/d 09 — mobile menu lengkap
- [ ] FE-NAV-10 s/d 14 — CV dropdown & PDF
- [ ] FE-NAV-15 s/d 17 — skill filter
- [ ] FE-NAV-18 s/d 24 — typing, reveal, footer
- [ ] FE-FRM-01 s/d 18 — form validation lengkap
- [ ] FE-UI-04 s/d 09 — link, PDF, gambar, alt
- [ ] FE-SEO-08 — base path produksi

### 10.3 Responsive & Compatibility

- [ ] 320, 375, 390, 414, 768, 1024, 1280, 1920 px
- [ ] Chrome, Edge, Firefox, Safari, Safari iOS, Chrome Android
- [ ] Tidak ada horizontal scroll di semua breakpoint
- [ ] Zoom 200% & orientation change
- [ ] Font diblokir → fallback aman
- [ ] JS disabled → konten inti tetap terbaca

### 10.4 Accessibility

- [ ] Axe 0 critical/serious
- [ ] Keyboard-only full flow
- [ ] Skip link berfungsi
- [ ] Heading & landmark valid
- [ ] Form label + error announcement
- [ ] Kontras teks ≥ 4.5:1
- [ ] Focus indicator terlihat
- [ ] Reduced motion dihormati
- [ ] Screen reader test (NVDA + VoiceOver)

### 10.5 Performance

- [ ] Lighthouse mobile ≥ 85 / a11y ≥ 95
- [ ] LCP ≤ 2.5 s
- [ ] INP ≤ 200 ms
- [ ] CLS ≤ 0.1
- [ ] Total initial transfer ≤ 1.5 MB
- [ ] Gambar WebP/AVIF + `srcset`
- [ ] Bundle JS/CSS ≤ 50 KB

### 10.6 Security & Backend (jika v2 aktif)

- [ ] Client-side XSS payload tidak dieksekusi
- [ ] `rel="noopener noreferrer"` pada semua `target="_blank"`
- [ ] Security headers & TLS valid
- [ ] Semua BE-API P0 pass
- [ ] Semua BE-AUTH P0 pass
- [ ] Semua BE-RBAC P0 pass
- [ ] SQL/NoSQL injection test pass
- [ ] Rate limit & 429 terverifikasi
- [ ] 500 tidak membocorkan stack trace

### 10.7 Sign-off

- [ ] Regression penuh selesai
- [ ] 0 defect S1/S2 terbuka
- [ ] Test summary report dibuat
- [ ] QA Lead approve
- [ ] Product Owner approve
- [ ] Deploy production

---

## 11. Automation Plan

### 11.1 Prioritas Otomasi

| Prioritas | Skenario | Tool |
|---|---|---|
| P0 | Build smoke, anchor, mobile menu, CV dropdown, skill filter, form validation | Playwright |
| P0 | Base path & asset 200 | Playwright request |
| P1 | Axe scan, keyboard flow | Playwright + axe-core |
| P1 | Lighthouse budget | Lighthouse CI |
| P1 | Broken links | Playwright crawler / lychee |
| P2 | Visual regression 3 breakpoint | Playwright screenshot |
| P2 | Unit logika filter/validasi | Vitest |
| Blueprint | API contract, auth, RBAC | Playwright API / Supertest |

### 11.2 Setup

```bash
npm i -D @playwright/test @axe-core/playwright @lhci/cli vitest jsdom
npx playwright install --with-deps
```

### 11.3 Skeleton Playwright

```js
// tests/e2e/portfolio.spec.js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/web-portofolio/';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE);
});

test('semua section ter-render', async ({ page }) => {
  for (const id of ['home', 'skills', 'portfolio', 'certificates', 'services', 'contact']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator('#home h1')).toBeVisible();
});

test('mobile menu buka, tutup via Escape, fokus kembali', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const btn = page.getByRole('button', { name: /toggle menu/i });
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(btn).toBeFocused();
});

test('skill filter hanya menampilkan kategori terpilih', async ({ page }) => {
  await page.getByRole('button', { name: 'Frontend' }).click();
  const cards = page.locator('.tech-card:visible');
  await expect(cards).toHaveCount(4);
  for (const card of await cards.all()) {
    await expect(card).toHaveAttribute('data-category', 'frontend');
  }
});

test('form invalid tidak memicu mailto', async ({ page }) => {
  let navigated = false;
  page.on('framenavigated', () => { navigated = true; });
  await page.getByRole('button', { name: /send message/i }).click();
  await expect(page.locator('#name')).toBeFocused(); // native validation
  expect(navigated).toBe(false);
});

test('0 critical/serious axe', async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.filter(v => ['critical', 'serious'].includes(v.impact))).toEqual([]);
});
```

### 11.4 Lighthouse CI Budget

```json
{
  "ci": {
    "collect": { "staticDistDir": "./dist", "numberOfRuns": 3 },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["warn", { "maxNumericValue": 200 }]
      }
    }
  }
}
```

### 11.5 CI Pipeline (GitHub Actions)

```yaml
name: QA
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - run: npx lhci autorun
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: qa-report
          path: playwright-report/
```

### 11.6 Exit Automation

- P0 100% automated sebelum rilis berikutnya.
- P1 ≥ 80% automated dalam 2 sprint.
- Jalankan pada setiap PR + nightly untuk Lighthouse.
- Simpan artifact 30 hari; screenshot diff untuk visual regression.

---

## 12. Temuan Awal dari Static Review

> **Metode:** pembacaan source code dan output `dist/`. **Belum diverifikasi di browser.** Status: **Open** sampai dieksekusi.
>
> **Update 7 Nov 2026:** sebagian temuan sudah diperbaiki dan diverifikasi. Lihat `docs/QA_FIXES.md` untuk status terkini dan bukti pengujian.

| ID | Severity | Modul | Temuan | Bukti | Rekomendasi | Test Ref |
|---|---|---|---|---|---|---|
| QA-01 | **S2** | Contact | Form hanya `mailto:`; tanpa handler mail client, submit gagal senyap. Tidak ada pesan sukses/error. | `src/main.js` baris 165–182 | Tambah API/Formspree, state loading/success/error, fallback tampilkan alamat email. | FE-FRM-13 |
| QA-02 | **S2** | Performance | Gambar proyek 1.21 MB + 852 KB + 104 KB (total ±2.1 MB), format PNG tanpa `srcset`. | `public/projects/*.png` | Konversi WebP/AVIF, resize ke lebar tampil, tambah `srcset`/`sizes`. | FE-PERF-07/09 |
| QA-03 | **S2** | Accessibility | Tidak ada skip link; keyboard user harus melewati seluruh nav. | `index.html` | Tambah `<a href="#home" class="sr-only focus:not-sr-only">Skip to content</a>`. | FE-A11Y-02 |
| QA-04 | **S2** | Contact/A11y | Tidak ada `aria-invalid`, `aria-describedby`, `aria-live`; error hanya native browser. | `contact.html`, `main.js` | Tambah container error per field + `role="alert"`/`aria-live="polite"`. | FE-A11Y-09, FE-FRM-18 |
| QA-05 | **S2** | Accessibility | `text-zinc-500` (#71717a) pada #050505/#0d0d0d ≈ 4.0–4.1:1, di bawah 4.5:1 untuk teks 12–14px. | `contact.html` label, `footer.html` | Ganti ke `text-zinc-400` (#a1a1aa) atau naikkan ukuran/bold. | FE-A11Y-10 |
| QA-06 | **S3** | Contact | Tidak ada `maxlength` pada nama/email/pesan; body `mailto:` panjang bisa terpotong. | `contact.html` | Tambah `maxlength` (nama 100, email 254, pesan 2.000) + counter. | FE-FRM-09 |
| QA-07 | **S3** | Accessibility | `lang="en"` sementara sebagian konten berbahasa Indonesia. | `index.html` vs `contact.html` | Tambah `lang="id"` pada elemen paragraf Indonesia atau ubah bahasa konten. | FE-A11Y-15 |
| QA-08 | **S3** | SEO | Tidak ada Open Graph, Twitter Card, canonical, `robots.txt`, `sitemap.xml`, JSON-LD. | `index.html` | Tambah metadata sosial + canonical + sitemap. | FE-SEO-02/04/05/06 |
| QA-09 | **S3** | Accessibility | Input memakai `:focus` dengan `outline: none` + border 1px; indikator fokus berpotensi < 3:1 area (WCAG 2.4.11). | `style.css` 580–597 | Gunakan `:focus-visible` dengan outline 2px + offset. | FE-A11Y-12 |
| QA-10 | **S3** | UX | Ikon hamburger tidak berubah menjadi "close" saat menu terbuka; state hanya terlihat dari layout. | `navbar.html`, `main.js` | Ganti ikon/X atau animasi saat `aria-expanded="true"`. | FE-NAV-04 |
| QA-11 | **S3** | Deployment | Asset/reference memakai path relatif `./...`; aman di root sub-path, tetapi rapuh jika URL berubah/di-refactor ke routing. | section HTML | Gunakan path yang di-resolve Vite (import asset) atau konsisten dengan `base`. | FE-SEO-08 |
| QA-12 | **S3** | Security | Tidak ada CSP/security header; GitHub Pages tidak mendukung custom header. | Hosting | Tambah meta CSP minimal atau pindah ke host yang mendukung header (Netlify/Vercel/Cloudflare). | BE-SEC-01 |
| QA-13 | **S3** | Process | Tidak ada automated test, lint, maupun CI; rilis bergantung manual. | `package.json` | Tambah Playwright + ESLint + GitHub Actions. | Automation |
| QA-14 | **S4** | Typography | Google Fonts eksternal: render-blocking + privasi + risiko gagal jaringan. | `index.html` 10–12 | Self-host font (woff2) + `font-display: swap`. | FE-PERF-11/15 |
| QA-15 | **S4** | Content | Nama file `sertifikat_course_dicoding_Adhika_pyhton.pdf` salah eja ("pyhton"). | `public/certificates` | Rename + update link; case-sensitive di Linux. | FE-UI-06/12 |
| QA-16 | **S4** | SEO | Tidak ada `apple-touch-icon`/manifest. | `index.html` | Tambah bila PWA/instalasi mobile diinginkan. | FE-SEO |

### 12.1 Ringkasan Temuan

| Severity | Jumlah |
|---|---|
| S1 Critical | 0 |
| S2 High | 5 |
| S3 Medium | 8 |
| S4 Low | 3 |
| **Total** | **16** |

---

## 13. Traceability Matrix

| Requirement | Test IDs |
|---|---|
| Halaman dapat diakses & semua section tampil | FE-NAV-01, FE-SEO-08, FE-SEO-09 |
| Navigasi desktop & mobile berfungsi | FE-NAV-02..09, FE-RES-01..06 |
| CV dapat diunduh | FE-NAV-10..14, FE-UI-07 |
| Filter skill akurat | FE-NAV-15..17 |
| Animasi tidak mengganggu & tidak menyebabkan CLS | FE-NAV-18..21, FE-PERF-05, FE-A11Y-13 |
| Form memvalidasi input & mengirim kontak | FE-FRM-01..18 |
| Input aman dari XSS/injection | FE-FRM-10..11, FE-UI-05 |
| Tampilan konsisten lintas browser & device | FE-RES-01..12, FE-CB-01..10, FE-UI-01..03 |
| Aksesibel WCAG 2.2 AA | FE-A11Y-01..17 |
| Performa memenuhi Core Web Vitals | FE-PERF-01..15 |
| Konten & tautan akurat | FE-UI-04..14, FE-SEO-01..09 |
| API mengembalikan status code benar | BE-API-01..20 |
| Autentikasi & sesi aman | BE-AUTH-01..16 |
| Otorisasi RBAC & anti-IDOR | BE-RBAC-01..11 |
| Integritas data & aman dari injection | BE-DB-01..20 |
| Error handling & observability | BE-ERR-01..14 |
| Security header & dependency | BE-SEC-01..06 |

---

## 14. Defect Report Template & Sign-off

### 14.1 Template Defect

```markdown
**Defect ID:** BUG-YYYYMMDD-XXX
**Title:** [Modul] Ringkasan singkat
**Severity:** S1 / S2 / S3 / S4
**Priority:** P0 / P1 / P2 / P3
**Environment:** Browser / OS / Viewport / Build
**Precondition:** ...
**Steps to Reproduce:**
1. ...
2. ...
**Actual Result:** ...
**Expected Result:** ...
**Evidence:** screenshot / video / console log / HAR
**Test Case Ref:** FE-XXX-XX
**Assignee:** ...
**Status:** Open / In Progress / Fixed / Verified / Reopened
```

### 14.2 Test Summary Report (diisi saat eksekusi)

| Metric | Target | Actual | Status |
|---|---|---|---|
| Total test case dieksekusi | — | — | — |
| Pass | — | — | — |
| Fail | — | — | — |
| Blocked | — | — | — |
| P0 pass rate | 100% | — | — |
| P1 pass rate | ≥ 95% | — | — |
| Defect S1/S2 open | 0 | — | — |
| Lighthouse mobile | ≥ 85 | — | — |
| Accessibility | ≥ 95 | — | — |
| LCP / INP / CLS | ≤ 2.5 s / ≤ 200 ms / ≤ 0.1 | — | — |

### 14.3 Sign-off

| Peran | Nama | Tanggal | Keputusan |
|---|---|---|---|
| QA Engineer | | | GO / NO-GO |
| Frontend Developer | | | GO / NO-GO |
| Product Owner | | | GO / NO-GO |

---

**Akhir dokumen.**
