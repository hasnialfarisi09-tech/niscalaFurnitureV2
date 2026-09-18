"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Calculator,
  Check,
  ChevronDown,
  Layers,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Tv,
  UtensilsCrossed,
  BedDouble,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import {
  formatRupiah,
  KITCHEN_ITEMS,
  OTHER_CATEGORIES,
  MaterialOption,
} from "@/data/pricing-calculator";
import { cn } from "@/lib/cn";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";

type FurnitureType = "kitchen" | "wardrobe" | "backdrop" | "bed";

interface AreaCostSimulatorProps {
  city: string;
  className?: string;
}

export function AreaCostSimulator({
  city,
  className,
}: AreaCostSimulatorProps) {
  const selectId = useId();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine pricing tier (Dalam Kota DK vs Luar Kota LK)
  const isDK = useMemo(() => {
    const c = city.toLowerCase();
    return (
      c.includes("bandung") ||
      c.includes("cimahi") ||
      c.includes("sumedang") ||
      c.includes("cianjur") ||
      c.includes("sukabumi")
    );
  }, [city]);

  const regionLabel = isDK ? "Tarif Workshop Utama (DK)" : "Tarif Wilayah (LK)";

  // Base Items from official pricing database
  const cabBawah = useMemo(
    () => KITCHEN_ITEMS.find((i) => i.id === "cab_bawah") ?? KITCHEN_ITEMS[0],
    []
  );
  const lemariPakaian = useMemo(
    () => OTHER_CATEGORIES.find((i) => i.id === "lemari_pakaian") ?? OTHER_CATEGORIES[0],
    []
  );
  const backdropTv = useMemo(
    () => OTHER_CATEGORIES.find((i) => i.id === "backdrop_tv") ?? OTHER_CATEGORIES[1],
    []
  );
  const dipanRanjang = useMemo(
    () => OTHER_CATEGORIES.find((i) => i.id === "dipan_ranjang") ?? OTHER_CATEGORIES[2],
    []
  );

  // State
  const [furnitureType, setFurnitureType] = useState<FurnitureType>("kitchen");

  // Active item & options depending on category
  const activeItem = useMemo(() => {
    switch (furnitureType) {
      case "kitchen":
        return cabBawah;
      case "wardrobe":
        return lemariPakaian;
      case "backdrop":
        return backdropTv;
      case "bed":
        return dipanRanjang;
    }
  }, [furnitureType, cabBawah, lemariPakaian, backdropTv, dipanRanjang]);

  // Selected material option ID
  const [selectedOptionId, setSelectedOptionId] = useState<string>(() => {
    // Default to Multiplek HPL (usually 4th option or first with mult_hpl)
    return (
      cabBawah.options.find((o) => o.id.includes("mult_hpl"))?.id ??
      cabBawah.options[0].id
    );
  });

  // Dropdown open/close state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isDropdownOpen]);

  // When furnitureType changes, reset selectedOptionId to a sensible default in that category
  const handleCategoryChange = (type: FurnitureType) => {
    setFurnitureType(type);
    setIsDropdownOpen(false);

    let targetItem = cabBawah;
    if (type === "wardrobe") targetItem = lemariPakaian;
    else if (type === "backdrop") targetItem = backdropTv;
    else if (type === "bed") targetItem = dipanRanjang;

    const defaultOpt =
      targetItem.options.find((o) => o.id.includes("mult")) ??
      targetItem.options[0];
    setSelectedOptionId(defaultOpt.id);
  };

  // Group options by material name (Substrate grouping)
  const groupedOptions = useMemo(() => {
    const groups: Array<{ groupName: string; options: MaterialOption[] }> = [];
    for (const opt of activeItem.options) {
      const existing = groups.find((g) => g.groupName === opt.name);
      if (existing) {
        existing.options.push(opt);
      } else {
        groups.push({ groupName: opt.name, options: [opt] });
      }
    }
    return groups;
  }, [activeItem]);

  // Active selected option
  const selectedOption = useMemo(() => {
    return (
      activeItem.options.find((o) => o.id === selectedOptionId) ??
      activeItem.options[0]
    );
  }, [activeItem, selectedOptionId]);

  // Kitchen sub-options:
  // 1. Panjang Kabinet Bawah
  // 2. Panjang Kabinet Atas (Standar)
  // 3. Panjang Kabinet Atas Full Plafond
  // Poin 2 & 3 saling eksklusif (hanya bisa dipilih salah satu)
  const [lowerLength, setLowerLength] = useState<number>(3.0);
  const [upperType, setUpperType] = useState<"standard" | "full_ceiling">(
    "standard"
  );
  const [upperLength, setUpperLength] = useState<number>(3.0);

  // Wardrobe / Backdrop sub-options (M2)
  const [width, setWidth] = useState<number>(2.0);
  const [height, setHeight] = useState<number>(2.4);

  // Bed sub-options (Kasur)
  const [bedSize, setBedSize] = useState<"single" | "queen" | "king">("queen");

  // Price calculations based on official workshop rate book
  const calculation = useMemo(() => {
    let subtotal = 0;
    let formulaText = "";
    let dimensionText = "";

    const price = isDK ? selectedOption.priceDK : selectedOption.priceLK;

    if (furnitureType === "kitchen") {
      if (upperType === "standard") {
        // Peraturan 1 (Poin 2): Panjang Kabinet Bawah + Panjang Kabinet Atas x Harga
        const totalLength = lowerLength + upperLength;
        subtotal = Math.round(totalLength * price);
        dimensionText = `Bawah ${lowerLength}m + Atas ${upperLength}m (Total ${totalLength} m1)`;
        formulaText = `(${lowerLength}m + ${upperLength}m) × ${formatRupiah(price)}/m1`;
      } else {
        // Peraturan 2 (Poin 3): (Panjang Kabinet Atas x 2) + Panjang Kabinet Bawah x Harga
        const effectiveLength = upperLength * 2 + lowerLength;
        subtotal = Math.round(effectiveLength * price);
        dimensionText = `Bawah ${lowerLength}m + Atas Full Plafond (2x) ${upperLength}m (Total ${effectiveLength} m1)`;
        formulaText = `((${upperLength}m × 2) + ${lowerLength}m) × ${formatRupiah(price)}/m1`;
      }
    } else if (furnitureType === "wardrobe" || furnitureType === "backdrop") {
      const areaM2 = Math.round(width * height * 10) / 10;
      subtotal = Math.round(areaM2 * price);
      dimensionText = `${width} m (P) × ${height} m (T) = ${areaM2} m²`;
      formulaText = `${areaM2} m² × ${formatRupiah(price)}/m²`;
    } else if (furnitureType === "bed") {
      let bedM2 = 3.2; // Queen 1.6 x 2.0
      let bedLabel = "Queen (160×200)";
      if (bedSize === "single") {
        bedM2 = 2.4; // 1.2 x 2.0
        bedLabel = "Single (120×200)";
      } else if (bedSize === "king") {
        bedM2 = 3.6; // 1.8 x 2.0
        bedLabel = "King (180×200)";
      }

      subtotal = Math.round(bedM2 * price);
      dimensionText = `1 Unit Dipan ${bedLabel}`;
      formulaText = `${bedM2} m² × ${formatRupiah(price)}/m²`;
    }

    return { subtotal, formulaText, dimensionText };
  }, [
    furnitureType,
    selectedOption,
    lowerLength,
    upperType,
    upperLength,
    width,
    height,
    bedSize,
    isDK,
  ]);

  const furnitureLabel = useMemo(() => {
    switch (furnitureType) {
      case "kitchen":
        return "Kitchen Set Custom";
      case "wardrobe":
        return "Lemari Pakaian Custom";
      case "backdrop":
        return "Backdrop TV & Panel";
      case "bed":
        return "Tempat Tidur / Dipan Custom";
    }
  }, [furnitureType]);

  const waMessage = [
    `Halo Niscala Furniture, saya sedang melihat info layanan area ${city}.`,
    `Saya mencoba kalkulasi cepat untuk kebutuhan:`,
    `- Kategori: ${furnitureLabel}`,
    `- Bahan & Model: ${selectedOption.name} — ${selectedOption.model}`,
    `- Ukuran/Dimensi: ${calculation.dimensionText}`,
    `- Estimasi Hasil Simulasi: ${formatRupiah(calculation.subtotal)} (${regionLabel})`,
    ``,
    `Apakah bisa dijadwalkan konsultasi dan survey aktual ke lokasi saya di ${city}? Terima kasih.`,
  ].join("\n");

  const waUrl = buildWhatsAppUrl({
    source: "calculator",
    message: waMessage,
  });

  return (
    <div
      className={cn(
        "relative rounded-xl border border-primary/20 bg-surface-container-lowest p-space-lg shadow-panel transition-all sm:p-space-xl",
        className
      )}
    >
      {/* Decorative subtle gold gradient header highlight */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-primary/5 blur-2xl" />

      {/* Header section */}
      <div className="relative border-b border-border-hairline pb-space-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-label-xs font-semibold text-primary">
            <MapPin aria-hidden className="size-3" />
            Area {city}
          </span>
          <span className="text-[11px] font-medium text-muted-gray">
            {regionLabel}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Calculator className="size-4" />
          </div>
          <h3 className="text-headline-xs font-semibold text-on-surface">
            Simulasi Biaya Cepat di {city}
          </h3>
        </div>
        <p className="mt-1 text-body-xs leading-relaxed text-on-surface-variant">
          Pilih jenis furniture dan ukuran untuk melihat perkiraan biaya terukur
          berdasarkan database resmi workshop kami.
        </p>
      </div>

      {/* Interactive Controls */}
      <div className="relative mt-space-md space-y-space-md">
        {/* Step 1: Furniture Category */}
        <div>
          <label className="block text-label-xs font-semibold uppercase tracking-wider text-muted-gray mb-1.5">
            1. Jenis Furniture:
          </label>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => handleCategoryChange("kitchen")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-2 text-center text-label-xs transition-all cursor-pointer",
                furnitureType === "kitchen"
                  ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                  : "border-border-hairline bg-surface hover:border-primary/40 hover:bg-surface-container-low text-on-surface-variant"
              )}
            >
              <UtensilsCrossed className="size-4" />
              <span>Kitchen Set</span>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange("wardrobe")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-2 text-center text-label-xs transition-all cursor-pointer",
                furnitureType === "wardrobe"
                  ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                  : "border-border-hairline bg-surface hover:border-primary/40 hover:bg-surface-container-low text-on-surface-variant"
              )}
            >
              <Layers className="size-4" />
              <span>Lemari / Partisi</span>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange("backdrop")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-2 text-center text-label-xs transition-all cursor-pointer",
                furnitureType === "backdrop"
                  ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                  : "border-border-hairline bg-surface hover:border-primary/40 hover:bg-surface-container-low text-on-surface-variant"
              )}
            >
              <Tv className="size-4" />
              <span>Backdrop TV</span>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange("bed")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-2 text-center text-label-xs transition-all cursor-pointer",
                furnitureType === "bed"
                  ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                  : "border-border-hairline bg-surface hover:border-primary/40 hover:bg-surface-container-low text-on-surface-variant"
              )}
            >
              <BedDouble className="size-4" />
              <span>Dipan Kamar</span>
            </button>
          </div>
        </div>

        {/* Step 2: Dimensions based on Category */}
        <div className="rounded-lg bg-surface-container-low p-space-sm">
          <label className="block text-label-xs font-semibold uppercase tracking-wider text-muted-gray mb-2">
            2. Dimensi & Ruang:
          </label>

          {furnitureType === "kitchen" && (
            <div className="space-y-2.5">
              {/* 1. Panjang Kabinet Bawah */}
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border-hairline bg-surface p-2.5 shadow-2xs">
                <div>
                  <span className="text-body-xs font-semibold text-on-surface block">
                    1. Panjang Kabinet Bawah
                  </span>
                  <span className="text-[11px] text-muted-gray">
                    Area meja dapur & laci (tinggi standar ~85 cm)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    aria-label="Kurangi panjang kabinet bawah"
                    onClick={() =>
                      setLowerLength((prev) =>
                        Math.max(1, Math.round((prev - 0.5) * 10) / 10)
                      )
                    }
                    className="flex size-7 items-center justify-center rounded border border-border-hairline bg-surface text-on-surface transition-colors hover:bg-surface-container cursor-pointer"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="min-w-16 text-center font-semibold text-body-sm text-primary">
                    {lowerLength} Meter
                  </span>
                  <button
                    type="button"
                    aria-label="Tambah panjang kabinet bawah"
                    onClick={() =>
                      setLowerLength((prev) =>
                        Math.min(15, Math.round((prev + 0.5) * 10) / 10)
                      )
                    }
                    className="flex size-7 items-center justify-center rounded border border-border-hairline bg-surface text-on-surface transition-colors hover:bg-surface-container cursor-pointer"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>

              {/* Pilihan Kabinet Atas: Poin 2 & Poin 3 (Hanya bisa dipilih 1) */}
              <div className="space-y-2 pt-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold uppercase tracking-wider text-muted-gray">
                    Tipe Kabinet Atas (Pilih Salah Satu):
                  </span>
                  <span className="text-[10px] font-semibold text-primary">
                    {upperType === "standard"
                      ? "Poin 2 Aktif"
                      : "Poin 3 Aktif (2x)"}
                  </span>
                </div>

                {/* 2. Panjang Kabinet Atas */}
                <div
                  onClick={() => setUpperType("standard")}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border p-2.5 transition-all cursor-pointer",
                    upperType === "standard"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs"
                      : "border-border-hairline bg-surface hover:border-primary/30 opacity-70 hover:opacity-100"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                        upperType === "standard"
                          ? "border-primary bg-primary text-white"
                          : "border-border-hairline bg-surface"
                      )}
                    >
                      {upperType === "standard" && (
                        <div className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-body-xs font-semibold",
                            upperType === "standard"
                              ? "text-primary font-bold"
                              : "text-on-surface"
                          )}
                        >
                          2. Panjang Kabinet Atas
                        </span>
                        <span className="rounded bg-surface-container px-1.5 py-0.5 text-[9px] font-semibold text-muted-gray">
                          Standar
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-gray block mt-0.5">
                        Tinggi standar s/d 80cm (Rumus: Bawah + Atas × Harga)
                      </span>
                    </div>
                  </div>

                  {upperType === "standard" ? (
                    <div
                      className="flex items-center justify-end gap-1.5 pl-6 sm:pl-0 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        aria-label="Kurangi panjang kabinet atas"
                        onClick={() =>
                          setUpperLength((prev) =>
                            Math.max(1, Math.round((prev - 0.5) * 10) / 10)
                          )
                        }
                        className="flex size-7 items-center justify-center rounded border border-border-hairline bg-surface text-on-surface transition-colors hover:bg-surface-container cursor-pointer"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="min-w-16 text-center font-semibold text-body-sm text-primary">
                        {upperLength} Meter
                      </span>
                      <button
                        type="button"
                        aria-label="Tambah panjang kabinet atas"
                        onClick={() =>
                          setUpperLength((prev) =>
                            Math.min(15, Math.round((prev + 0.5) * 10) / 10)
                          )
                        }
                        className="flex size-7 items-center justify-center rounded border border-border-hairline bg-surface text-on-surface transition-colors hover:bg-surface-container cursor-pointer"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="pl-6 sm:pl-0 text-right">
                      <span className="text-[11px] font-medium text-muted-gray hover:text-primary transition-colors">
                        Klik untuk pilih
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Panjang Kabinet Atas Full Plafond */}
                <div
                  onClick={() => setUpperType("full_ceiling")}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border p-2.5 transition-all cursor-pointer",
                    upperType === "full_ceiling"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs"
                      : "border-border-hairline bg-surface hover:border-primary/30 opacity-70 hover:opacity-100"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                        upperType === "full_ceiling"
                          ? "border-primary bg-primary text-white"
                          : "border-border-hairline bg-surface"
                      )}
                    >
                      {upperType === "full_ceiling" && (
                        <div className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-body-xs font-semibold",
                            upperType === "full_ceiling"
                              ? "text-primary font-bold"
                              : "text-on-surface"
                          )}
                        >
                          3. Panjang Kabinet Atas Full Plafond
                        </span>
                        <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                          2x Tarif
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-gray block mt-0.5">
                        Tinggi penuh hingga plafon (Rumus: (Atas × 2) + Bawah × Harga)
                      </span>
                    </div>
                  </div>

                  {upperType === "full_ceiling" ? (
                    <div
                      className="flex items-center justify-end gap-1.5 pl-6 sm:pl-0 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        aria-label="Kurangi panjang kabinet atas full plafond"
                        onClick={() =>
                          setUpperLength((prev) =>
                            Math.max(1, Math.round((prev - 0.5) * 10) / 10)
                          )
                        }
                        className="flex size-7 items-center justify-center rounded border border-border-hairline bg-surface text-on-surface transition-colors hover:bg-surface-container cursor-pointer"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="min-w-16 text-center font-semibold text-body-sm text-primary">
                        {upperLength} Meter
                      </span>
                      <button
                        type="button"
                        aria-label="Tambah panjang kabinet atas full plafond"
                        onClick={() =>
                          setUpperLength((prev) =>
                            Math.min(15, Math.round((prev + 0.5) * 10) / 10)
                          )
                        }
                        className="flex size-7 items-center justify-center rounded border border-border-hairline bg-surface text-on-surface transition-colors hover:bg-surface-container cursor-pointer"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="pl-6 sm:pl-0 text-right">
                      <span className="text-[11px] font-medium text-muted-gray hover:text-primary transition-colors">
                        Klik untuk pilih
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {(furnitureType === "wardrobe" || furnitureType === "backdrop") && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="block text-[11px] font-medium text-muted-gray mb-1">
                  Panjang (Meter):
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setWidth((prev) =>
                        Math.max(1, Math.round((prev - 0.2) * 10) / 10)
                      )
                    }
                    className="flex size-6 items-center justify-center rounded border border-border-hairline bg-surface hover:bg-surface-container cursor-pointer"
                  >
                    <Minus className="size-2.5" />
                  </button>
                  <span className="flex-1 text-center font-semibold text-label-sm text-on-surface">
                    {width} m
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setWidth((prev) =>
                        Math.min(10, Math.round((prev + 0.2) * 10) / 10)
                      )
                    }
                    className="flex size-6 items-center justify-center rounded border border-border-hairline bg-surface hover:bg-surface-container cursor-pointer"
                  >
                    <Plus className="size-2.5" />
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-medium text-muted-gray mb-1">
                  Tinggi (Meter):
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setHeight((prev) =>
                        Math.max(1, Math.round((prev - 0.2) * 10) / 10)
                      )
                    }
                    className="flex size-6 items-center justify-center rounded border border-border-hairline bg-surface hover:bg-surface-container cursor-pointer"
                  >
                    <Minus className="size-2.5" />
                  </button>
                  <span className="flex-1 text-center font-semibold text-label-sm text-on-surface">
                    {height} m
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setHeight((prev) =>
                        Math.min(4, Math.round((prev + 0.2) * 10) / 10)
                      )
                    }
                    className="flex size-6 items-center justify-center rounded border border-border-hairline bg-surface hover:bg-surface-container cursor-pointer"
                  >
                    <Plus className="size-2.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {furnitureType === "bed" && (
            <div className="grid grid-cols-3 gap-1.5 text-label-xs">
              <button
                type="button"
                onClick={() => setBedSize("single")}
                className={cn(
                  "rounded-md border p-1.5 text-center transition-colors cursor-pointer",
                  bedSize === "single"
                    ? "border-primary bg-primary/10 font-semibold text-primary"
                    : "border-border-hairline bg-surface text-on-surface-variant hover:border-primary/40"
                )}
              >
                <span className="block font-semibold">Single</span>
                <span className="text-[10px] text-muted-gray">120×200</span>
              </button>
              <button
                type="button"
                onClick={() => setBedSize("queen")}
                className={cn(
                  "rounded-md border p-1.5 text-center transition-colors cursor-pointer",
                  bedSize === "queen"
                    ? "border-primary bg-primary/10 font-semibold text-primary"
                    : "border-border-hairline bg-surface text-on-surface-variant hover:border-primary/40"
                )}
              >
                <span className="block font-semibold">Queen</span>
                <span className="text-[10px] text-muted-gray">160×200</span>
              </button>
              <button
                type="button"
                onClick={() => setBedSize("king")}
                className={cn(
                  "rounded-md border p-1.5 text-center transition-colors cursor-pointer",
                  bedSize === "king"
                    ? "border-primary bg-primary/10 font-semibold text-primary"
                    : "border-border-hairline bg-surface text-on-surface-variant hover:border-primary/40"
                )}
              >
                <span className="block font-semibold">King</span>
                <span className="text-[10px] text-muted-gray">180×200</span>
              </button>
            </div>
          )}
        </div>

        {/* Step 3: Material Specification with Custom Responsive Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <label
              htmlFor={selectId}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="block text-label-xs font-semibold uppercase tracking-wider text-muted-gray cursor-pointer"
            >
              3. Standar Bahan & Model:
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
            >
              <span>{activeItem.options.length} pilihan bahan</span>
              <ChevronDown
                className={cn(
                  "size-3 transition-transform duration-200",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>
          </div>

          {/* Trigger Button */}
          <button
            type="button"
            id={selectId}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            className={cn(
              "w-full text-left rounded-xl border bg-surface px-3.5 py-2.5 text-on-surface font-medium flex items-center justify-between gap-2 shadow-2xs transition-all cursor-pointer",
              isDropdownOpen
                ? "border-primary ring-2 ring-primary/20 bg-surface-container-lowest"
                : "border-border-hairline hover:border-primary/60 hover:bg-surface-container-low/40"
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 leading-tight">
                <span className="font-semibold text-xs sm:text-sm truncate">
                  {selectedOption.name}{" "}
                  <span className="text-on-surface-variant font-normal">
                    — {selectedOption.model}
                  </span>
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-primary shrink-0 mt-0.5 sm:mt-0">
                  (
                  {formatRupiah(
                    isDK ? selectedOption.priceDK : selectedOption.priceLK
                  )}{" "}
                  / {selectedOption.unit})
                </span>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "size-4 text-on-surface-variant transition-transform duration-200 shrink-0",
                isDropdownOpen && "rotate-180 text-primary"
              )}
            />
          </button>

          {/* Dropdown Options Listbox */}
          {isDropdownOpen && (
            <div
              role="listbox"
              className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-72 w-full overflow-y-auto rounded-2xl border border-border-hairline bg-surface shadow-2xl divide-y divide-border-hairline/40 focus:outline-none overscroll-contain"
            >
              {groupedOptions.map(({ groupName, options }) => (
                <div key={groupName} className="py-0.5">
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-gray bg-surface-container-low/95 sticky top-0 backdrop-blur-md z-10 flex items-center justify-between border-b border-border-hairline/30 mb-0.5">
                    <span>{groupName}</span>
                    <span className="font-medium text-[10px] lowercase text-on-surface-variant/70">
                      {options.length} model
                    </span>
                  </div>

                  {options.map((opt) => {
                    const isSelected = opt.id === selectedOption.id;
                    const price = isDK ? opt.priceDK : opt.priceLK;

                    return (
                      <button
                        type="button"
                        role="option"
                        key={opt.id}
                        aria-selected={isSelected}
                        onClick={() => {
                          setSelectedOptionId(opt.id);
                          setIsDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3.5 py-2.5 transition-colors flex items-center justify-between gap-3 cursor-pointer",
                          isSelected
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-surface-container-low text-on-surface"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium leading-snug">
                            <span
                              className={
                                isSelected
                                  ? "font-bold text-primary"
                                  : "text-on-surface font-semibold"
                              }
                            >
                              {opt.name}
                            </span>
                            <span className="text-on-surface-variant">
                              {" "}
                              — {opt.model}
                            </span>
                          </div>
                          {opt.description ? (
                            <p className="text-[11px] text-muted-gray mt-0.5 line-clamp-1">
                              {opt.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs font-bold",
                              isSelected ? "text-primary" : "text-on-surface-variant"
                            )}
                          >
                            {formatRupiah(price)} / {opt.unit}
                          </span>
                          {isSelected && (
                            <Check className="size-4 text-primary shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculation Summary Box */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-space-md shadow-inner">
          <div className="flex items-center justify-between text-label-xs text-muted-gray">
            <span>Estimasi Biaya ({city}):</span>
            <span className="font-mono text-[11px]">{calculation.formulaText}</span>
          </div>

          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className="text-headline-sm font-bold tracking-tight text-primary">
              {formatRupiah(calculation.subtotal)}
            </span>
            <span className="text-label-xs font-medium text-muted-gray">
              *Estimasi awal
            </span>
          </div>

          <ul className="mt-2.5 space-y-1 border-t border-primary/15 pt-2 text-[11px] text-on-surface-variant">
            <li className="flex items-center gap-1.5">
              <Check className="size-3 shrink-0 text-primary" />
              <span>Gratis konsultasi & survey pengukuran aktual di {city}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="size-3 shrink-0 text-primary" />
              <span>Sudah termasuk desain 3D visual & instalasi tim workshop</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="size-3 shrink-0 text-primary" />
              <span>Aksesoris standar engsel slow-motion & rel laci presisi</span>
            </li>
          </ul>
        </div>

        {/* Action Button: Directly Consult via WhatsApp */}
        <a
          href={waUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            track("whatsapp_click", {
              source: "calculator",
              context: `Simulasi Cepat ${city} - ${furnitureLabel} - ${selectedOption.model}`,
            })
          }
          className="group flex w-full min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-center text-label-md font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md cursor-pointer"
        >
          <MessageCircle className="size-4.5 transition-transform group-hover:scale-110" />
          <span>Konsultasikan Estimasi {city}</span>
        </a>

        {/* Secondary link for comprehensive multi-room calculation */}
        <div className="pt-1 text-center">
          <Link
            href="/simulasi-biaya"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-gray transition-colors hover:text-primary"
          >
            <span>Butuh hitung banyak ruangan sekaligus? Coba kalkulator lengkap</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
