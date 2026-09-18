/**
 * Service areas data for Niscala Furniture.
 *
 * Each area corresponds to an article category that developers can assign articles to.
 * Slugs provide clean URL endpoints under `/services/[slug]`.
 */

export interface ServiceArea {
  slug: string;
  name: string;
  city: string;
  seoTitle: string;
  headline: string;
  lead: string;
  seoDescription: string;
  coverageAreas: string[];
}

export const serviceAreas: ServiceArea[] = [
  {
    slug: "furniture-custom-bandung",
    name: "Interior & Furniture Custom Bandung",
    city: "Bandung",
    seoTitle: "Jasa Desain Interior & Furniture Custom Bandung",
    headline: "Desain interior & furniture custom presisi untuk hunian di Bandung.",
    lead: "Workshop langsung di Bandung dengan jangkauan survey ke seluruh Kota Bandung. Spesialis interior rumah, kitchen set tahan lembab, lemari pakaian built-in, lemari bawah tangga, hingga interior ruang kerja.",
    seoDescription: "Jasa desain interior & furniture custom di Bandung. Kitchen set, backdrop TV, lemari pakaian, dan interior ruangan dikerjakan di workshop sendiri dengan survey aktual & presisi.",
    coverageAreas: [
      "Bandung Kota",
      "Dago & Setiabudi",
      "Buahbatu & Batununggal",
      "Antapani & Arcamanik",
      "Kopo & Cibaduyut",
      "Sukajadi & Pasteur",
    ],
  },
  {
    slug: "furniture-custom-cimahi",
    name: "Interior & Furniture Custom Cimahi",
    city: "Cimahi",
    seoTitle: "Jasa Desain Interior & Furniture Custom Cimahi",
    headline: "Layanan desain interior & furniture custom terdekat untuk area Cimahi.",
    lead: "Survey langsung ke lokasi dan konsultasi tata letak di seluruh area Cimahi. Desain disesuaikan dengan dimensi aktual ruangan Anda dan diproduksi langsung dari workshop kami.",
    seoDescription: "Jasa desain interior dan pembuatan furniture custom di Cimahi: kitchen set, backdrop TV, lemari pakaian, dan partisi ruangan dengan pengerjaan rapi bergaransi.",
    coverageAreas: [
      "Cimahi Utara",
      "Cimahi Tengah",
      "Cimahi Selatan",
      "Cihanjuang",
      "Baros & Leuwigajah",
    ],
  },
  {
    slug: "furniture-custom-bandung-barat",
    name: "Interior & Furniture Custom Bandung Barat",
    city: "Bandung Barat",
    seoTitle: "Jasa Desain Interior & Furniture Custom Bandung Barat",
    headline: "Solusi desain interior & furniture custom kawasan Bandung Barat.",
    lead: "Melayani pembuatan interior dan furniture custom untuk perumahan, vila, dan apartemen di Bandung Barat seperti Padalarang, Kotabaru Parahyangan, hingga Lembang.",
    seoDescription: "Jasa interior dan furniture custom di Bandung Barat: Kotabaru Parahyangan, Padalarang, Lembang, dan sekitarnya. Material tahan lembab dan instalasi presisi.",
    coverageAreas: [
      "Kotabaru Parahyangan",
      "Padalarang",
      "Ngamprah",
      "Lembang & Parongpong",
      "Cisarua",
    ],
  },
  {
    slug: "furniture-custom-jakarta",
    name: "Interior & Furniture Custom Jakarta",
    city: "Jakarta",
    seoTitle: "Jasa Desain Interior & Furniture Custom Jakarta",
    headline: "Desain interior & furniture custom berkualitas untuk hunian di Jakarta.",
    lead: "Tim Niscala Furniture melayani survey terukur, pengiriman aman, dan pemasangan langsung di wilayah DKI Jakarta. Pilihan material HMR tahan lembab, multipleks pilihan, dan finishing HPL/Duco premium.",
    seoDescription: "Jasa desain interior & furniture custom Jakarta: kitchen set apartemen/rumah, walk-in closet, meja kerja, dan backdrop TV dengan desain modern minimalis.",
    coverageAreas: [
      "Jakarta Selatan",
      "Jakarta Barat",
      "Jakarta Pusat",
      "Jakarta Timur",
      "Jakarta Utara",
    ],
  },
  {
    slug: "furniture-custom-bogor",
    name: "Interior & Furniture Custom Bogor",
    city: "Bogor",
    seoTitle: "Jasa Desain Interior & Furniture Custom Bogor",
    headline: "Desain interior & furniture custom elegan untuk hunian di Bogor & Sentul.",
    lead: "Layanan pembuatan interior rumah, villa, dan furniture custom presisi di wilayah Bogor Kota dan Kabupaten. Mulai dari kitchen set tahan lembab, lemari pakaian built-in, hingga backdrop TV.",
    seoDescription: "Jasa desain interior & furniture custom Bogor: Sentul City, Cibinong, Pajajaran, dan sekitarnya. Survey aktual, desain 3D terukur, dan instalasi rapi bergaransi.",
    coverageAreas: [
      "Sentul City",
      "Bogor Kota & Pajajaran",
      "Cibinong & Bojonggede",
      "Gunung Putri",
      "Ciawi & Puncak",
    ],
  },
  {
    slug: "furniture-custom-depok",
    name: "Interior & Furniture Custom Depok",
    city: "Depok",
    seoTitle: "Jasa Desain Interior & Furniture Custom Depok",
    headline: "Spesialis desain interior & furniture custom hunian & apartemen di Depok.",
    lead: "Mewujudkan interior idaman untuk rumah tinggal dan unit apartemen di area Depok. Tim kami siap survey lokasi untuk kitchen set, lemari pakaian, ruang kerja, dan interior ruangan lengkap.",
    seoDescription: "Jasa desain interior dan furniture custom di Depok: Margonda, Cinere, Sawangan, Cimanggis. Pilihan material HMR tahan lembab dengan finishing HPL presisi.",
    coverageAreas: [
      "Margonda & Beji",
      "Cinere & Gandul",
      "Sawangan & Bojongsari",
      "Cimanggis",
      "Sukmajaya & Grand Depok City",
    ],
  },
  {
    slug: "furniture-custom-tangerang",
    name: "Interior & Furniture Custom Tangerang",
    city: "Tangerang",
    seoTitle: "Jasa Desain Interior & Furniture Custom Tangerang & BSD",
    headline: "Desain interior & custom furniture di Tangerang, BSD, & Gading Serpong.",
    lead: "Pengerjaan interior dan furniture custom terukur untuk hunian baru maupun renovasi di wilayah Tangerang Kota, Tangerang Selatan, BSD City, Bintaro, dan Alam Sutera.",
    seoDescription: "Spesialis desain interior & custom furniture Tangerang dan BSD: kitchen set elegan, lemari pakaian custom, kabinet bawah tangga, dan interior kamar tidur.",
    coverageAreas: [
      "BSD City & Serpong",
      "Gading Serpong",
      "Alam Sutera",
      "Bintaro & Ciputat",
      "Tangerang Kota & Karawaci",
    ],
  },
  {
    slug: "furniture-custom-bekasi",
    name: "Interior & Furniture Custom Bekasi",
    city: "Bekasi",
    seoTitle: "Jasa Desain Interior & Furniture Custom Bekasi",
    headline: "Desain interior dan produksi furniture custom untuk kawasan Bekasi.",
    lead: "Layanan konsultasi, survey presisi, dan instalasi interior untuk rumah tinggal dan komersial di area Bekasi Barat, Bekasi Timur, hingga Grand Galaxy dan Harapan Indah.",
    seoDescription: "Jasa desain interior & furniture custom Bekasi: kitchen set rapi, lemari kamar, backdrop TV, finishing HPL/duco premium, dan garansi instalasi.",
    coverageAreas: [
      "Summarecon Bekasi",
      "Harapan Indah",
      "Grand Galaxy & Pekayon",
      "Bekasi Barat & Timur",
      "Tambun & Cikarang",
    ],
  },
  {
    slug: "furniture-custom-sumedang",
    name: "Interior & Furniture Custom Sumedang",
    city: "Sumedang",
    seoTitle: "Jasa Desain Interior & Furniture Custom Sumedang",
    headline: "Layanan desain interior & furniture custom di Sumedang & Jatinangor.",
    lead: "Jarak dekat dari workshop Bandung memudahkan pengiriman dan survey cepat ke wilayah Sumedang. Melayani interior rumah tinggal, kos eksklusif, apartemen, hingga kantor.",
    seoDescription: "Jasa desain interior & furniture custom di Sumedang dan Jatinangor. Pembuatan kitchen set, kamar tidur, meja belajar, dan lemari custom dengan harga transparan.",
    coverageAreas: [
      "Jatinangor",
      "Sumedang Kota",
      "Tanjungsari",
      "Cimalaka",
      "Darmaraja",
    ],
  },
  {
    slug: "furniture-custom-banten",
    name: "Interior & Furniture Custom Banten",
    city: "Banten",
    seoTitle: "Jasa Desain Interior & Furniture Custom Banten",
    headline: "Desain interior & furniture custom untuk wilayah Banten & sekitarnya.",
    lead: "Melayani pengerjaan interior komprehensif untuk kawasan Serang, Cilegon, Tangerang Raya, dan seluruh provinsi Banten. Material awet, tata letak fungsional, dan pemasangan rapi.",
    seoDescription: "Jasa desain interior dan furniture custom di Banten: Serang, Cilegon, Pandeglang, dan Tangerang Raya. Kitchen set, interior rumah, villa, dan kantor.",
    coverageAreas: [
      "Kota Serang",
      "Kota Cilegon",
      "Kabupaten Serang",
      "Tangerang Raya",
      "Rangkasbitung & Pandeglang",
    ],
  },
];

export function getServiceAreaBySlug(slug: string): ServiceArea | undefined {
  return serviceAreas.find(
    (area) =>
      area.slug === slug ||
      area.slug === `furniture-custom-${slug.replace(/^interior-/, "")}`
  );
}

export function getAllServiceAreaSlugs(): string[] {
  return serviceAreas.map((area) => area.slug);
}
