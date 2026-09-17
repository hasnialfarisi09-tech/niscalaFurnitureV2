import { Clock, RotateCcw, ShieldCheck } from "lucide-react";

import { SurveyForm } from "@/components/forms/survey-form";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { SURVEY_ANCHOR_ID } from "@/components/layout/sticky-mobile-cta";
import { projectCount, servedLocations } from "@/data/projects";

/** Section 15 - Multi-step survey form. */
export function Survey() {
  return (
    <section
      id={SURVEY_ANCHOR_ID}
      className="bg-surface py-space-3xl lg:py-space-4xl"
    >
      <div className="container-editorial">
        <Reveal className="mx-auto max-w-3xl lg:max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-12 xl:gap-16 items-start">
            {/* Left Column - Desktop View Only */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between self-stretch space-y-space-lg pr-space-xs">
              <div className="space-y-space-md">
                <div className="text-[11px] font-bold tracking-widest text-[#B37400] dark:text-primary-container uppercase">
                  Formulir Estimasi Cepat · Gratis
                </div>
                <h2 className="text-3xl lg:text-[40px] font-bold text-on-surface leading-[1.18] tracking-tight">
                  Rencanakan ruangan impian Anda, mulai dari estimasi gratis ini.
                </h2>
                <p className="text-sm lg:text-base text-on-surface-variant leading-relaxed">
                  Ceritakan kebutuhan ruang Anda lewat 4 langkah singkat. Tim kami balas via WhatsApp dengan rekomendasi desain dan estimasi biaya, sebelum survey ke lokasi Anda.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3.5">
                    <div className="size-8 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="size-4.5 text-deep-black dark:text-primary-container" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface">
                        Konsultasi &amp; estimasi awal gratis
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                        Tanpa biaya tersembunyi, dan tidak ada kewajiban lanjut ke produksi.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="size-8 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="size-4.5 text-deep-black dark:text-primary-container" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface">
                        4 langkah singkat, sekitar 2 menit
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                        Tombol Kembali selalu tersedia - jawaban Anda tidak hilang saat pindah langkah.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="size-8 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center shrink-0 mt-0.5">
                      <RotateCcw className="size-4.5 text-deep-black dark:text-primary-container" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface">
                        Dibalas langsung via WhatsApp
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                        Rekomendasi desain dan estimasi biaya, sebelum kami jadwalkan survey ke lokasi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-border-hairline bg-surface-container-low/70 px-4 py-3 text-xs text-on-surface-variant font-medium">
                  <span className="font-bold text-on-surface text-sm sm:text-base">{projectCount}+</span>
                  <span>proyek terdokumentasi di {servedLocations.length} kota &amp; area</span>
                </div>
              </div>
            </div>

            {/* Right Column - Form Card */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl lg:rounded-3xl bg-surface-container-lowest p-space-lg shadow-panel sm:p-space-xl md:p-space-2xl border border-border-hairline/80">
                {/* Mobile-Only Header */}
                <div className="space-y-space-xs text-center lg:hidden mb-space-lg">
                  <Eyebrow>Formulir estimasi cepat</Eyebrow>
                  <h2 className="text-headline-md-mobile text-on-surface">
                    Rencanakan Ruangan Impian Anda
                  </h2>
                  <p className="text-body-sm text-on-surface-variant">
                    Lengkapi empat langkah sederhana berikut untuk mendapatkan estimasi dan rekomendasi desain.
                  </p>
                </div>

                <SurveyForm />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
