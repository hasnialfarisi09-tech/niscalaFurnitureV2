# Dokumentasi Handoff & Panduan Merge Branch untuk Developer A

**Tanggal**: 18 September 2026  
**Penyusun**: Developer B (`hasnialfarisi09-tech`)  
**Kepada**: Developer A (Lead Developer / Maintainer Repo Kanonik)  
**Branch Sumber**: `feat/public-reviews` (Commit terbaru: `6d544e7`)  
**Repo Sumber**: `https://github.com/hasnialfarisi09-tech/niscalaFurnitureV2.git`  
**Branch Target**: `master` (di repo kanonik `https://github.com/xamonxx/niscalaFurniture.git`)  
**Merge Base Terakhir**: `eaee9d3`  

---

## 1. Ringkasan Eksekutif (Executive Summary)

Dokumen ini disusun untuk memberikan gambaran komprehensif kepada **Developer A** mengenai seluruh fitur baru, arsitektur data, formula kalkulasi workshop, serta perbaikan antarmuka yang telah diselesaikan di branch `feat/public-reviews`.

Pekerjaan utama berfokus pada pembangunan ekosistem kalkulasi biaya transparan, perluasan SEO lokal multi-area, dan optimasi konversi lead:
1. **Halaman Simulasi Biaya Utama (`/simulasi-biaya`)** berbasis komponen modular `CostCalculator`.
2. **Kartu Simulator Biaya Cepat In-Page (`AreaCostSimulator`)** yang terintegrasi di seluruh 10 halaman area layanan (`/services/[slug]`).
3. **Database Tarif Resmi Workshop (`src/data/pricing-calculator.ts`)** yang memetakan zona Dalam Kota (DK) vs Luar Kota (LK), konversi Meter Lari (M1), Meter Persegi (M2), dan Unit.
4. **Aturan Khusus Dimensi & Rumus Multiplier Kitchen Set** dengan sistem pilihan saling eksklusif (*mutually exclusive*) antara kabinet atas standar vs kabinet atas full plafond (2x tarif).
5. **Rumus Khusus Meja Island Kitchen**: $(\text{Panjang} : 0{,}6) \times \text{Tarif Bahan}$.
6. **Perluasan SEO Layanan Wilayah (10 Kota/Kabupaten Target)** dengan internal link cluster dan portofolio proyek terkurasi untuk desktop.
7. **Custom Accessible Dropdown Listbox** dengan *substrate grouping* yang responsif tanpa horizontal overflow pada mobile.

Seluruh kode telah lolos audit kualitas ketat, lulus `tsc --noEmit` (**0 error**), `eslint src` (**0 error, 0 warning**), dan berhasil mem-build seluruh **133 halaman statis** (`npm run build`) dengan sempurna.

---

## 2. Kondisi Awal Repo (Sebelum Fitur Dikembangkan)

Pada titik awal percabangan (`eaee9d3`):
1. **Belum Ada Fitur Simulasi Biaya Mandiri**:
   - Calon klien hanya dapat memperkirakan biaya dengan mengirim pesan WhatsApp manual atau mengisi formulir survei.
   - Belum ada rute `/simulasi-biaya` dan belum ada komponen kalkulator per komponen furniture.
2. **Database Tarif Workshop Belum Terintegrasi di Frontend**:
   - Belum tersedia skema data TypeScript untuk penentuan tarif Dalam Kota (DK) vs Luar Kota (LK) berdasarkan wilayah workshop.
3. **Halaman Layanan Area (`/services/[slug]`) Masih Terbatas & Statis**:
   - Hanya mencakup 6 area dasar (Bandung, Cimahi, Bandung Barat, Jakarta, Tangerang, Bekasi). Belum ada Bogor, Depok, Sumedang, dan Banten.
   - Halaman area belum memiliki alat interaktif untuk menghitung estimasi biaya langsung di tempat (*in-page*).
4. **Area Tombol CTA Hero Masih Terbatas**:
   - Area CTA Hero hanya memuat tombol portofolio dan survei standar tanpa shortcut kalkulasi mandiri.
5. **Formulir Estimasi Cepat Desktop Masih Menggunakan 1 Kolom**:
   - Bagian survei (`src/components/sections/survey.tsx`) menggunakan layout 1 kolom terpusat yang menyisakan ruang kosong lebar di layar desktop.

---

## 3. Kondisi Repo Terkini (Siap untuk Merge)

Pada commit terbaru (`6d544e7`):

### A. Halaman Kalkulator Simulasi Biaya Utama (`/simulasi-biaya`)
- **Fitur Interaktif Penuh**: Komponen `CostCalculator` memungkinkan klien memilih provinsi & kota, memilih kategori furniture (Kitchen Set, Lemari & Partisi, Backdrop TV & Wallpanel, Kamar Tidur), mengatur dimensi (M1, M2, Unit), serta memilih bahan material.
- **Indikator Jumlah Pilihan (Counter Badges)**: Tombol tab kategori menampilkan badge dinamis `✓ X item` (desktop) atau `✓ X` (mobile) dan mempertahankan aksen gold aktif saat pengguna berpindah tab.
- **Formula Meja Island Sesuai Standar Workshop**:
  $$\text{Subtotal} = \left(\frac{\text{Panjang}}{0{,}6}\right) \times \text{Tarif Bahan}$$
- **Panel Ringkasan & WhatsApp CTA**: Sidebar desktop sticky dengan rincian per-komponen dan tombol pesan WhatsApp prefilled otomatis.

### B. Inline AreaCostSimulator di 10 Halaman Layanan Area (`/services/[slug]`)
- **Simulasi Langsung Tanpa Pindah Halaman**: Komponen `AreaCostSimulator` dipasang tepat di bawah kartu *"Standar Pengerjaan Niscala di {Kota}"*.
- **Deteksi Otomatis Zona Tarif**: Otomatis mendeteksi tarif Workshop Utama (DK) untuk Bandung, Cimahi, Sumedang, Cianjur, Sukabumi; serta Tarif Wilayah (LK) untuk Jabodetabek & Banten.
- **Kategori Lengkap & Dropdown Material**:
  - Menyediakan 4 kategori: *Kitchen Set*, *Lemari / Partisi*, *Backdrop TV*, dan *Dipan Kamar*.
  - Dilengkapi custom listbox dropdown bahan lengkap yang dikelompokkan berdasarkan substrate (Block Board, Multiplek HPL, Multiplek Duco, PVC Board Anti Air, Alumunium) sesuai database resmi.

### C. Aturan Khusus Dimensi & Rumus Multiplier Kitchen Set
Sesuai kebutuhan lapangan workshop, kartu dimensi Kitchen Set telah diperbarui:
1. Opsi lama (*"Atas + Bawah"*, *"Bawah Saja"*, *"Atas Saja"*) telah dihilangkan.
2. Diganti dengan 3 kontrol ukuran:
   - **`1. Panjang Kabinet Bawah`**: Memiliki stepper meter tersendiri.
   - **`2. Panjang Kabinet Atas` (Standar)**
   - **`3. Panjang Kabinet Atas Full Plafond` (Tinggi Penuh Plafon / 2x Tarif)**
3. **Aturan Saling Eksklusif**: Poin 2 dan Poin 3 hanya bisa dipilih salah satu (radio selector; tidak bisa aktif keduanya).
4. **Rumus Perhitungan Otomatis**:
   - **Jika memilih Poin 2**:
     $$\text{Subtotal} = (\text{Panjang Kabinet Bawah} + \text{Panjang Kabinet Atas}) \times \text{Tarif}$$
   - **Jika memilih Poin 3**:
     $$\text{Subtotal} = ((\text{Panjang Kabinet Atas} \times 2) + \text{Panjang Kabinet Bawah}) \times \text{Tarif}$$

### D. Perluasan Jangkauan SEO Lokal ke 10 Wilayah Layanan
- Memperluas target area dari 6 menjadi **10 wilayah strategis**:
  1. Kota Bandung (`furniture-custom-bandung`)
  2. Kota Cimahi (`furniture-custom-cimahi`)
  3. Kabupaten Bandung Barat (`furniture-custom-bandung-barat`)
  4. DKI Jakarta (`furniture-custom-jakarta`)
  5. **Kota & Kab. Bogor (`furniture-custom-bogor`) [BARU]**
  6. **Kota Depok (`furniture-custom-depok`) [BARU]**
  7. Tangerang & BSD (`furniture-custom-tangerang`)
  8. Kota & Kab. Bekasi (`furniture-custom-bekasi`)
  9. **Kabupaten Sumedang (`furniture-custom-sumedang`) [BARU]**
  10. **Provinsi Banten (`furniture-custom-banten`) [BARU]**
- Optimasi kata kunci penelusuran: *"Jasa Desain Interior & Furniture Custom [Kota]"* pada judul SEO, headline, lead, OpenGraph, JSON-LD, footer internal link cluster, dan dropdown navigasi.

### E. Portofolio Showcase Khusus Desktop di Samping Simulator
- Mengisi ruang kosong sebelah kiri simulator biaya pada tampilan desktop (`lg:col-span-7`, `hidden lg:block`) dengan 2 kartu portofolio proyek terkurasi sesuai wilayah terkait.

### F. Redesain Split 2 Kolom Survei Cepat & Tombol Hero
- Bagian survei cepat pada Beranda menggunakan layout split 2 kolom di desktop (kolom kiri: value proposition, 3 butir reassurance, dan proof badge `62+ proyek`; kolom kanan: form survei interaktif).
- Tombol *"Simulasi Biaya"* bergaya frosted glass ditambahkan di Hero section.

---

## 4. Rincian Berkas yang Ditambahkan dan Dimodifikasi

### A. Berkas Baru (New Files)
| File Path | Deskripsi & Fungsi |
| :--- | :--- |
| [`src/app/simulasi-biaya/page.tsx`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/app/simulasi-biaya/page.tsx) | Halaman publik Next.js App Router untuk rute `/simulasi-biaya` dengan metadata SEO lengkap. |
| [`src/components/calculator/cost-calculator.tsx`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/components/calculator/cost-calculator.tsx) | Komponen kalkulator utama lengkap: manajemen state modular, counter badges, dropdown listbox, formula island, rincian biaya, dan WhatsApp generator. |
| [`src/components/calculator/area-cost-simulator.tsx`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/components/calculator/area-cost-simulator.tsx) | Komponen kartu simulasi in-page per area: deteksi otomatis kota DK/LK, dropdown bahan bertingkat, rumus kitchen set standar vs full plafond (2x), dan WhatsApp CTA. |
| [`src/data/pricing-calculator.ts`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/data/pricing-calculator.ts) | Database tarif resmi workshop, data provinsi, pemetaan zona kota/kabupaten, dan spesifikasi seluruh opsi material. |

### B. Berkas yang Dimodifikasi (Modified Files)
| File Path | Deskripsi Perubahan |
| :--- | :--- |
| [`src/data/service-areas.ts`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/data/service-areas.ts) | Menambahkan 4 wilayah baru (Bogor, Depok, Sumedang, Banten), optimasi SEO Interior & Furniture Custom, dan fallback slug resolver. |
| [`src/app/services/[slug]/page.tsx`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/app/services/[slug]/page.tsx) | Integrasi kartu `AreaCostSimulator`, galeri portofolio desktop di kolom kiri, filter artikel kompatibel mundur (*backwards-compatible*), dan JSON-LD schema update. |
| [`src/components/layout/footer.tsx`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/components/layout/footer.tsx) | Menambahkan kluster internal links *"Layanan Desain Interior & Furniture Custom Wilayah"* untuk 10 kota jangkauan. |
| [`src/components/layout/header-nav.tsx`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/components/layout/header-nav.tsx) | Memperlebar dropdown jangkauan area (`w-72`) dan menambahkan scroll container vertikal halus agar navigasi rapi di layar rendah. |
| [`src/components/sections/hero.tsx`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/components/sections/hero.tsx) | Menambahkan tombol CTA "Simulasi Biaya" dengan icon `Calculator` dan styling frosted glass. |
| [`src/components/sections/survey.tsx`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/components/sections/survey.tsx) | Layout split 2 kolom pada desktop dengan kartu reassurance dan proof badge di sebelah kiri. |
| [`src/components/admin/article-editor.tsx`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/components/admin/article-editor.tsx) | Menambahkan kategori preset artikel untuk 10 wilayah baru. |
| [`src/components/layout/nav-links.ts`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/components/layout/nav-links.ts) | Mendaftarkan menu `/simulasi-biaya` ke navigasi utama. |
| [`src/app/sitemap.ts`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/app/sitemap.ts) | Menambahkan entri sitemap XML untuk `/simulasi-biaya`. |
| [`src/lib/site.ts`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/lib/site.ts) | Memperbarui tagline dan meta deskripsi untuk mencakup kata kunci "Desain Interior & Furniture Custom". |
| [`src/app/manifest.ts`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/src/app/manifest.ts) | Menambahkan icon maskable 512x512 dan konfigurasi PWA manifest. |
| [`.gitignore`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/.gitignore) | Mengabaikan build packages Android (`*.apk`, `*.aab`, `/android-package/`) agar tidak mengotori git. |
| [`CHANGELOG.md`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/CHANGELOG.md) | Mencatat seluruh entri perubahan di bawah `## Unreleased` sesuai format standar `AGENTS.md`. |
| [`CODEX_MEMORY.md`](file:///c:/Users/Hasni%20Alfarisi/Documents/niscalaFurniture/CODEX_MEMORY.md) | Memperbarui peta arsitektur dan dokumentasi rute halaman. |

---

## 5. Panduan Langkah Demi Langkah Merge untuk Developer A

Developer A dapat melakukan merge dari repo Developer B (`hasnialfarisi09-tech/niscalaFurnitureV2`) ke repo kanonik (`xamonxx/niscalaFurniture`) dengan langkah mudah berikut:

### Langkah 1: Tambahkan Remote Developer B (Jika Belum Ada)
```bash
# Masuk ke folder repo kanonik lokal Developer A
cd /path/to/niscalaFurniture

# Pastikan berada di master terbaru
git switch master
git pull origin master

# Tambahkan remote Developer B (cukup sekali)
git remote add dev-b https://github.com/hasnialfarisi09-tech/niscalaFurnitureV2.git

# Ambil branch dan commit terbaru Developer B
git fetch dev-b feat/public-reviews
```

### Langkah 2: Buat Branch Pengujian Merge
```bash
git switch -c merge/simulasi-biaya-and-areas master
git merge dev-b/feat/public-reviews
```

---

## 6. Analisis Potensi Konflik dan Panduan Resolusinya

Berdasarkan hasil simulasi 3-way merge (`git merge-tree`), terdapat **2 berkas** yang mengalami *content conflict* ringan akibat kedua developer melakukan pembaruan paralel di area tersebut:

### 1. `CHANGELOG.md`
- **Penyebab**: Developer A dan Developer B sama-sama menambahkan catatan perubahan di bawah `## Unreleased`.
- **Solusi**: Pertahankan **kedua entri perubahan**. Letakkan entri terbaru Developer B di atas atau berdampingan dengan entri Developer A. Jangan menghapus catatan dari salah satu pihak.

### 2. `src/components/sections/survey.tsx`
- **Penyebab**: Developer A (commit `41cd648`) dan Developer B sama-sama mendesain ulang wrapper formulir survei menjadi 2 kolom editorial (`lg:grid-cols-12`).
- **Solusi**:
  - Konsep kedua desain identik (memuat reassurance: *Konsultasi gratis*, *4 langkah singkat*, *Dibalas WhatsApp*, serta badge *62+ proyek*).
  - Gunakan struktur 2 kolom yang responsif di mana kolom kiri tampil pada desktop (`lg:col-span-5`) dan header form di dalam kartu disembunyikan di desktop (`lg:hidden`) agar tidak terjadi pengulangan judul ganda.

*(Catatan: Komponen baru `AreaCostSimulator`, `service-areas.ts`, `services/[slug]/page.tsx`, `footer.tsx`, dan `header-nav.tsx` tidak menimbulkan konflik sama sekali).*

---

## 7. Verifikasi dan Pengujian Kualitas Pasca-Merge

Setelah merge selesai dan konflik diselesaikan, jalankan 3 perintah wajib:

```bash
# 1. Pengecekan TypeScript (Wajib 0 error)
npm run typecheck

# 2. Pengecekan ESLint (Wajib 0 error, 0 warning)
npm run lint

# 3. Pengujian Production Build (Wajib generate 133 halaman statis)
npm run build
```

### Checklist Verifikasi Manual di Browser:
- [ ] Buka `http://localhost:3000/simulasi-biaya` — pastikan kalkulator interaktif berfungsi, counter badges tab aktif, dan dropdown material tampil rapi tanpa horizontal scrollbar di mobile (375px).
- [ ] Buka `http://localhost:3000/services/furniture-custom-bandung` — scroll ke bawah kartu *"Standar Pengerjaan Niscala di Bandung"*, pastikan kartu `AreaCostSimulator` tampil elegan dengan portofolio proyek di sebelah kirinya (pada layar desktop).
- [ ] Uji Kitchen Set di `AreaCostSimulator`:
  - Pastikan opsi tombol lama ("Atas + Bawah") sudah tidak ada.
  - Cek Poin 1 (Panjang Kabinet Bawah) dapat diatur panjangnya.
  - Klik Poin 2 (Kabinet Atas Standar): pastikan subtotal terhitung $(\text{Bawah} + \text{Atas}) \times \text{Tarif}$.
  - Klik Poin 3 (Kabinet Atas Full Plafond): pastikan Poin 2 otomatis nonaktif dan subtotal terhitung $((\text{Atas} \times 2) + \text{Bawah}) \times \text{Tarif}$.
- [ ] Buka `http://localhost:3000/services/furniture-custom-bogor` (atau Depok/Sumedang/Banten) — pastikan halaman area baru terbuka normal dan mendeteksi tarif wilayahnya secara tepat.
- [ ] Buka Footer di halaman mana saja — periksa baris internal link 10 wilayah jangkauan dapat diklik dengan benar.

---

## 8. Finalisasi Merge ke `master` Kanonik

Setelah semua pengujian lulus:
```bash
# Commit resolusi merge
git commit -m "Merge branch 'dev-b/feat/public-reviews' into master"

# Gabungkan ke master lokal
git switch master
git merge merge/simulasi-biaya-and-areas --ff-only

# Push ke repository kanonik
git push origin master
```

---

*Dokumen ini disusun sebagai panduan resmi sinkronisasi & integrasi antar-developer proyek Niscala Furniture.*
