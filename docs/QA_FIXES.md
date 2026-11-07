# Laporan Implementasi Perbaikan QA

**Tanggal:** 7 November 2026  
**Acuan:** `docs/QA_TEST_PLAN.md`  
**Status:** Implemented & Verified

---

## 1. Ringkasan Perubahan

| Temuan QA | Status | Perbaikan |
|---|---|---|
| QA-01 — Contact form gagal senyap | ✅ Fixed (client-side) | Validasi kustom, status sukses/error, panel fallback, tombol salin pesan |
| QA-02 — Gambar proyek ±2.1 MB | ✅ Fixed | AVIF + WebP 640/1280, `<picture>` + `srcset` + `sizes` |
| QA-03 — Tidak ada skip link | ✅ Fixed | Skip link fokus pertama, terlihat saat keyboard focus |
| QA-04 — Error form tidak diumumkan | ✅ Fixed | `aria-invalid`, `aria-describedby`, `role="status"`, fokus ke field invalid |
| QA-05 — Kontras `zinc-500` gagal AA | ✅ Fixed | Teks 12–14px dinaikkan ke `zinc-400`; placeholder dinaikkan |
| QA-06 — Tidak ada batas panjang input | ✅ Fixed | `maxlength` nama 100, email 254, pesan 2.000 + counter |
| QA-07 — Bahasa konten campuran | ✅ Fixed | Paragraf Indonesia diberi `lang="id"` |
| QA-08 — Metadata sosial & SEO kurang | ✅ Fixed | OG, Twitter Card, canonical, JSON-LD, robots, sitemap, manifest |
| QA-09 — Focus indicator lemah | ✅ Fixed | `:focus-visible` outline 2px pada input |
| QA-10 — Ikon menu tidak berubah | ✅ Fixed | Ikon hamburger ↔ close + label dinamis |
| QA-11 — Path relatif rapuh | ✅ Dipertahankan | Path relatif aman untuk base `/web-portofolio/`; diverifikasi 200 |
| QA-12 — Tidak ada security header | ⚠️ Sebagian | Tidak bisa via GitHub Pages; CSP perlu host/edge |
| QA-13 — Tidak ada automated test/CI | ⚠️ Sebagian | Smoke test lokal dijalankan; CI belum ditambahkan |
| QA-14 — Font eksternal | ⏳ Ditunda | Prioritas rendah; `display=swap` + preconnect sudah ada |
| QA-15 — Typo nama file sertifikat | ⏳ Ditunda | Perlu rename file + update link (case-sensitive) |
| QA-16 — apple-touch-icon/manifest | ✅ Fixed | Ikon 180/192/512 + manifest |

---

## 2. File yang Berubah

| File | Perubahan |
|---|---|
| `index.html` | Meta SEO/OG/Twitter/JSON-LD, manifest, skip link, `id="main-content"` |
| `src/main.js` | Validasi form, status/error, fallback mailto, copy message, ikon menu, label ARIA |
| `src/sections/contact.html` | `novalidate`, error container, counter, fallback panel, padding mobile, `break-all` |
| `src/sections/portfolio.html` | `<picture>` AVIF/WebP untuk 3 proyek |
| `src/sections/hero.html` | Kontras teks, inset dekorasi responsif |
| `src/sections/navbar.html` | Ikon buka/tutup, label ARIA, kontras |
| `src/sections/footer.html` | Kontras teks |
| `src/sections/certificates.html` | `rel="noopener noreferrer"` |
| `src/style.css` | Skip link, focus-visible, error/success form, fallback, `picture` |
| `public/favicon.svg` | Favicon brand baru (monogram A.) |
| `public/404.html` | Halaman 404 brand |
| `public/og-image.png` | OG image 1200×630 |
| `public/apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Ikon aplikasi |
| `public/manifest.webmanifest`, `robots.txt`, `sitemap.xml` | Metadata deployment |
| `public/projects/*-640|1280.{avif,webp}` | Varian gambar teroptimasi |
| `scripts/optimize-images.mjs` | Generator gambar & ikon |
| `package.json` | Script `optimize:images`, dependency `sharp`, update Vite via audit fix |

---

## 3. Hasil Verifikasi

### 3.1 Build

```text
dist/index.html                 49.90 kB │ gzip: 8.87 kB
dist/assets/index-*.css         41.74 kB │ gzip: 8.70 kB
dist/assets/index-*.js           6.78 kB │ gzip: 2.57 kB
✓ built successfully
```

### 3.2 Lighthouse (mobile, production build)

| Kategori | Skor |
|---|---|
| Performance | **100** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

| Metrik | Nilai |
|---|---|
| LCP | 1.5 s |
| CLS | 0.001 |
| TBT | 0 ms |

### 3.3 Smoke Test Browser (Chrome headless)

**42/42 check lulus**, mencakup:

- Render seluruh section & tidak ada duplikat `id`
- Skip link fokus pertama & terlihat
- Filter skill (4/8 card) dan `aria-pressed`
- Dropdown CV + Escape
- 3 gambar proyek termuat + source AVIF
- Form: submit kosong, email invalid, submit valid, status sukses, fallback, copy
- Mobile menu: buka/tutup, label ARIA, ikon, Escape, fokus kembali, klik link
- Tidak ada overflow horizontal pada 320/375/390/414/768/1024/1440 px
- `prefers-reduced-motion`
- No-JS fallback
- Tidak ada error console/page

### 3.4 Asset & Keamanan

- Semua aset lokal, PDF, ikon, manifest, robots, sitemap → **HTTP 200**
- `npm audit` → **0 vulnerabilities**
- Anchor internal → **0 broken**
- Duplikat `id` → **0**

### 3.5 Optimasi Gambar

| Proyek | PNG asli | AVIF 1280 | WebP 1280 | AVIF 640 |
|---|---:|---:|---:|---:|
| EksplorJogja | 1.21 MB | 68.4 KB | 92.0 KB | 22.3 KB |
| Angkringan POS | 104 KB | 28.7 KB | 33.6 KB | 9.0 KB |
| Angkringan East | 852 KB | 62.3 KB | 90.9 KB | 23.1 KB |
| **Total** | **±2.12 MB** | **159 KB** | **217 KB** | **54 KB** |

---

## 4. Catatan & Langkah Lanjutan

1. **Contact form masih `mailto:`** — belum ada penyimpanan/pengiriman server. Untuk produksi serius, ganti dengan API/Formspree/Resend dan pertahankan fallback.
2. **URL produksi diasumsikan** `https://adhika26.github.io/web-portofolio/`. Jika berbeda, perbarui canonical, OG URL, `robots.txt`, dan `sitemap.xml`.
3. **Security header** (CSP/HSTS) tidak dapat diatur di GitHub Pages. Pertimbangkan Cloudflare/Netlify/Vercel bila diperlukan.
4. **Font** masih dari Google Fonts. Self-host jika ingin menghilangkan ketergantungan eksternal.
5. **Rename** `sertifikat_course_dicoding_Adhika_pyhton.pdf` → `...python.pdf` lalu update link.
6. Regenerasi gambar setelah mengganti gambar proyek:

```bash
npm run optimize:images
npm run build
```

---

**Kesimpulan:** seluruh temuan High (S2) sudah ditangani, build bersih, Lighthouse 100/100/100/100, dan 42 smoke check lulus.
