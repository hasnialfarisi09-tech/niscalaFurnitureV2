# Dokumentasi Handoff & Panduan Merge Branch untuk Developer A

**Tanggal**: 17 September 2026  
**Penyusun**: Developer B (`hasnialfarisi09-tech`)  
**Kepada**: Developer A (Lead Developer / Canonical Maintainer)  
**Branch Sumber**: `feat/public-reviews` (commit `3191311`)  
**Repo Sumber**: `https://github.com/hasnialfarisi09-tech/niscalaFurnitureV2.git`  
**Branch Target**: `master` (di repo kanonik `https://github.com/xamonxx/niscalaFurniture.git`)  
**Merge Base Terakhir**: `eaee9d3`  

---

## 1. Ringkasan Eksekutif (Executive Summary)

Dokumen ini disusun untuk memberikan gambaran lengkap kepada **Developer A** mengenai seluruh fitur baru, perubahan kode, dan perbaikan antarmuka yang telah diselesaikan di branch `feat/public-reviews`. 

Pekerjaan utama berfokus pada pembangunan **Kalkulator Simulasi Biaya Custom Interaktif (`/simulasi-biaya`)**, database tarif resmi workshop, penyempurnaan formulir survei estimasi cepat, penambahan tombol CTA hero, serta perbaikan responsiveness dan micro-interaction mobile-first tanpa horizontal overflow.

Seluruh kode telah melewati audit kualitas, lulus `tsc --noEmit` (**0 error**), dan `eslint src` (**0 error, 0 warning**).

---

## 2. Kondisi Awal Repo (Sebelum Fitur Ditambahkan)

Pada titik awal (`eaee9d3`):
1. **Belum Tersedia Fitur Simulasi Biaya Interaktif**:
   - Calon klien hanya dapat memperkirakan biaya dengan menghubungi WhatsApp secara manual atau mengisi form survei.
   - Belum ada rute `/simulasi-biaya`, belum ada komponen kalkulator per komponen furniture modular.
2. **Database Tarif Belum Terintegrasi di Frontend**:
   - Belum ada skema data TypeScript untuk penentuan tarif Dalam Kota (DK) vs Luar Kota (LK), konversi Meter Lari (M1), Meter Persegi (M2), maupun satuan Unit.
3. **Hero Section Belum Memiliki Akses Cepat ke Estimasi**:
   - Area tombol CTA di Hero section hanya memuat tombol portofolio dan survei standar tanpa shortcut simulasi mandiri.
4. **Tampilan Formulir Survei Cepat Desktop**:
   - Formulir survei (`src/components/sections/survey.tsx`) masih menggunakan layout 1 kolom terpusat di layar desktop.

---

## 3. Kondisi Repo Terkini (Siap untuk Merge)

Pada commit terbaru (`3191311`):
1. **Halaman `/simulasi-biaya` Berfungsi Penuh**:
   - Dilengkapi komponen reaktif `CostCalculator` yang menghitung estimasi secara real-time.
   - Terindeks di `src/app/sitemap.ts` dan navigasi utama `src/components/layout/nav-links.ts`.
2. **Database Tarif Resmi Terstandarisasi (`src/data/pricing-calculator.ts`)**:
   - Memuat data lengkap wilayah provinsi (Jawa Barat, DKI Jakarta, Banten, Lainnya) serta seluruh kota/kabupaten.
   - Penentuan otomatis tarif **Area Workshop Utama (DK)** untuk Bandung Raya, Cimahi, Sumedang, Cianjur, dan Sukabumi; serta **Area Luar Kota (LK)** untuk kota lainnya tanpa menampilkan singkatan teknis internal ("DK"/"LK") kepada pengguna.
3. **Custom Responsive Dropdown Listbox**:
   - Seluruh tag native `<select>` telah digantikan oleh custom accessible listbox (`SimpleDropdown` dan `MaterialDropdown`).
   - Khusus pemilihan bahan/model, terdapat pengelompokan jenis bahan (*substrate grouping*) dengan *sticky headers* (Block Board, Multiplek HPL, Duco, PVC Board, Alumunium) yang lebarnya terikat 100% pada kontainer (`w-full`), menghilangkan bug horizontal overflow di mobile.
4. **Indikator Jumlah Pilihan pada Tab Kategori (Category Counter Badges)**:
   - Tombol kategori (*Kitchen Set*, *Lemari & Partisi*, *Backdrop TV & Wallpanel*, *Kamar Tidur*) dilengkapi badge reaktif `✓ X item` (desktop) atau `✓ X` (mobile).
   - Ketika pengguna berpindah ke kategori lain, tab kategori sebelumnya tetap memiliki aksen gold aktif (`border-primary/40`, `bg-primary/5`) dan badge jumlah item, sehingga pengguna selalu mengetahui kategori mana saja yang telah terisi.
5. **Rumus Khusus Workshop untuk Meja Island**:
   - Perhitungan Meja Island menerapkan rumus workshop resmi:
     $$\text{Subtotal} = \left(\frac{\text{Panjang}}{0{,}6}\right) \times \text{Tarif Bahan}$$
   - Dilengkapi badge penanda khusus di kartu item, catatan rumus di input dimensi, serta format rincian transparan pada ringkasan sidebar dan pesan WhatsApp.
6. **Desain Editorial Split 2 Kolom pada Survei Cepat Desktop**:
   - Bagian *Estimasi Cepat* (`src/components/sections/survey.tsx`) menampilkan layout 2 kolom pada desktop (kolom kiri: value proposition, 3 butir reassurance, dan proof badge `62+ proyek`; kolom kanan: form survei interaktif) dengan tetap mempertahankan layout 1 kolom yang ringkas di mobile.
7. **Tombol "Simulasi Biaya" Elegan di Hero**:
   - Tombol bergaya frosted glass dengan border gold (`border-primary-container/40`) dan icon kalkulator di Hero CTA. Tipografi tombol mobile disesuaikan ke `text-label-md` (13px, tinggi minimal 44px) agar tidak berdesakan.

---

## 4. Rincian Berkas yang Ditambahkan dan Dimodifikasi

### A. Berkas Baru (New Files)
1. **`src/app/simulasi-biaya/page.tsx`**
   - Halaman publik Next.js App Router untuk rute `/simulasi-biaya`.
   - Dilengkapi metadata SEO (title, meta description, OpenGraph) dan integrasi komponen `CostCalculator`.
2. **`src/components/calculator/cost-calculator.tsx`**
   - Komponen inti kalkulator interaktif custom furniture:
     - Manajemen state modular per item (`ItemState`).
     - Custom listbox dropdown (`SimpleDropdown` & `MaterialDropdown`).
     - Navigasi tab kategori dengan penghitung item (`categoryCounts`).
     - Perhitungan grand total, total M1, total M2, dan rincian subtotal.
     - Generator pesan prefilled WhatsApp (`buildWhatsAppUrl`).
     - Panel ringkasan sticky sidebar untuk desktop.
3. **`src/data/pricing-calculator.ts`**
   - Single source of truth untuk database tarif resmi workshop, data provinsi, pemetaan zona kota/kabupaten, dan spesifikasi material (Block Board, Plywood, Duco, PVC Board, Alumunium).

### B. Berkas yang Dimodifikasi (Modified Files)
1. **`src/components/sections/hero.tsx`**
   - Menambahkan tombol "Simulasi Biaya" dengan icon `Calculator` dan styling frosted glass.
   - Merapikan padding dan tipografi tombol responsif (`text-label-md` mobile, `text-label-lg` desktop).
2. **`src/components/sections/survey.tsx`**
   - Menerapkan layout split 2 kolom pada desktop (`lg:grid-cols-12`) dengan kartu reassurance di sebelah kiri.
3. **`src/components/layout/nav-links.ts`**
   - Mendaftarkan menu navigasi "Simulasi Biaya" (`/simulasi-biaya`) ke header utama.
4. **`src/app/sitemap.ts`**
   - Menambahkan URL `https://niscalafurniture.com/simulasi-biaya` ke dalam sitemap XML.
5. **`src/lib/whatsapp.ts`**
   - Menambahkan tipe source `"calculator"` pada WhatsApp lead tracker URL generator.
6. **`CHANGELOG.md`**
   - Menambahkan entri dokumentasi di bawah `## Unreleased` sesuai format standar `AGENTS.md`.
7. **`CODEX_MEMORY.md`**
   - Memperbarui peta arsitektur dan rute halaman baru `/simulasi-biaya`.

---

## 5. Panduan Langkah Demi Langkah Merge untuk Developer A

Developer A dapat melakukan merge dari repo Developer B (`hasnialfarisi09-tech/niscalaFurnitureV2`) ke repo kanonik (`xamonxx/niscalaFurniture`) dengan langkah berikut:

### Langkah 1: Tambahkan Remote Developer B (Jika Belum Ada)
```bash
# Masuk ke folder repo kanonik lokal Developer A
cd /path/to/niscalaFurniture

# Pastikan berada di branch master terbaru
git switch master
git pull origin master

# Tambahkan remote Developer B
git remote add dev-b https://github.com/hasnialfarisi09-tech/niscalaFurnitureV2.git

# Fetch commit terbaru dari Developer B
git fetch dev-b feat/public-reviews
```

### Langkah 2: Buat Branch Pengujian Merge
```bash
git switch -c merge/simulasi-biaya
git merge dev-b/feat/public-reviews
```

---

## 6. Analisis Potensi Konflik dan Panduan Resolusinya

Berdasarkan simulasi 3-way merge (`git merge-tree`), terdapat **2 berkas** yang mengalami *content conflict* ringan akibat kedua developer sama-sama melakukan pembaruan di area tersebut:

### 1. `CHANGELOG.md`
- **Penyebab**: Developer A dan Developer B sama-sama menambahkan catatan rilis baru di bawah heading `## Unreleased`.
- **Solusi**: Pertahankan **kedua entri perubahan** (gabungkan entri terbaru Developer B di atas atau sejajar dengan entri Developer A). Jangan menghapus catatan dari salah satu pihak.

### 2. `src/components/sections/survey.tsx`
- **Penyebab**: Developer A (commit `41cd648`) dan Developer B sama-sama mendesain ulang wrapper formulir survei menjadi 2 kolom editorial (`lg:grid-cols-12`).
- **Solusi**:
  - Konsep desain kedua developer pada dasarnya identik (memuat butir reassurance: *Konsultasi gratis*, *4 langkah singkat*, *Dibalas WhatsApp*, serta badge *62+ proyek*).
  - Pastikan menggunakan token warna dan tipografi semantik yang sudah divalidasi (`container-editorial`, `bg-surface`, `SurveyForm`).
  - Jika Developer A ingin mempertahankan versi responsif milik Developer B, kolom sebelah kiri aktif di desktop (`lg:col-span-5`) dan header form di dalam kartu disembunyikan di desktop (`lg:hidden`) agar tidak terjadi pengulangan judul ganda.

---

## 7. Verifikasi dan Pengujian Kualitas Pasca-Merge

Setelah konflik terselesaikan, jalankan rangkaian pengujian wajib berikut:

```bash
# 1. Pengecekan tipe TypeScript
npm run typecheck

# 2. Pengecekan linter (Wajib 0 error sebelum commit)
npm run lint

# 3. Jalankan development server
npm run dev
```

### Checklist Verifikasi Manual di Browser:
- [ ] Buka `http://localhost:3000/simulasi-biaya` — pastikan halaman terbuka tanpa error console.
- [ ] Uji pemilihan Provinsi & Kota — verifikasi tarif Dalam Kota (Bandung dkk) vs Luar Kota (Jakarta dkk) beralih otomatis.
- [ ] Uji Dropdown Material — klik salah satu bahan, pastikan dropdown tampil rapi, sticky header kategori terlihat, dan tidak ada scrollbar horizontal pada viewport HP (375px / 390px).
- [ ] Uji Centang Komponen — centang item di tab *Kitchen Set*, perhatikan badge counter muncul (`✓ X item`). Pindah ke tab *Lemari*, pastikan tab *Kitchen Set* tetap memiliki tanda gold aktif beserta jumlah itemnya.
- [ ] Uji Meja Island — aktifkan Meja Island Kitchen, isi panjang 1.2 m. Pastikan subtotal terhitung `(1.2 / 0.6) * tarif = 2 * tarif`.
- [ ] Uji Tombol WhatsApp — klik "Konsultasikan via WhatsApp", pastikan text template terisi lengkap dengan rincian per item dan total estimasi.
- [ ] Buka Beranda (`/`) — cek tombol "Simulasi Biaya" pada hero section dan layout survei estimasi cepat di bagian bawah.

---

## 8. Finalisasi Merge ke `master`

Setelah semua checklist dan pengujian lulus:
```bash
# Commit resolusi merge
git commit -m "Merge branch 'dev-b/feat/public-reviews' into master"

# Pindahkan ke branch master lokal dan gabungkan
git switch master
git merge merge/simulasi-biaya --ff-only

# Push ke repo kanonik
git push origin master
```

---

*Dokumen ini dibuat otomatis sebagai panduan resmi sinkronisasi antar-developer proyek Niscala Furniture.*
