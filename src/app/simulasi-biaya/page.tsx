import { CostCalculator } from "@/components/calculator/cost-calculator";
import { PageHeader } from "@/components/layout/page-header";
import { Guarantees } from "@/components/sections/guarantees";
import {
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";

const SIMULASI_DESCRIPTION =
  "Simulasi perkiraan biaya pembuatan furniture custom (Kitchen Set, Lemari, Backdrop TV, Kamar Tidur). Hitung transparan dengan satuan Meter Lari (M1) dan Meter Persegi (M2).";

export const metadata = buildMetadata({
  title: "Simulasi Biaya & Kalkulator Furniture Custom",
  description: SIMULASI_DESCRIPTION,
  path: "/simulasi-biaya",
});

function simulasiJsonLd() {
  return jsonLdGraph(
    webPageJsonLd({
      path: "/simulasi-biaya",
      name: "Simulasi Biaya & Kalkulator Furniture Custom",
      description: SIMULASI_DESCRIPTION,
      breadcrumb: true,
    }),
    breadcrumbJsonLd([
      { name: "Beranda", path: "/" },
      { name: "Simulasi Biaya", path: "/simulasi-biaya" },
    ])
  );
}

export default function SimulasiBiayaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(simulasiJsonLd())}
      />

      <PageHeader
        eyebrow="Kalkulator Furniture Custom"
        title="Simulasi perkiraan biaya transparan untuk ruangan Anda."
        lead="Hitung perkiraan biaya pembuatan kitchen set dan interior custom Anda secara instan. Semua komponen bersifat opsional, pilih bahan dan ukuran sesuai rencana Anda."
      />

      <section className="bg-surface min-h-screen">
        <CostCalculator />
      </section>

      {/* Jaminan Standar Mutu Workshop */}
      <Guarantees />
    </>
  );
}
