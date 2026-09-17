"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bed,
  Check,
  ChevronDown,
  Info,
  Layers,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Tv,
  UtensilsCrossed,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

import {
  ACCESSORIES_ITEMS,
  FurnitureItemConfig,
  formatRupiah,
  KITCHEN_ITEMS,
  OTHER_CATEGORIES,
  PROVINCES_DATA,
  Region,
} from "@/data/pricing-calculator";
import { cn } from "@/lib/cn";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";

type ItemState = {
  enabled: boolean;
  optionId: string;
  length: number | "";
  height: number | "";
  qty: number | "";
};

type CalculatorState = Record<string, ItemState>;

const ALL_ITEMS: FurnitureItemConfig[] = [
  ...KITCHEN_ITEMS,
  ...OTHER_CATEGORIES,
  ...ACCESSORIES_ITEMS,
];

const CATEGORY_TABS = [
  {
    id: "kitchen" as const,
    label: "Kitchen Set Custom",
    icon: UtensilsCrossed,
  },
  {
    id: "wardrobe" as const,
    label: "Lemari & Partisi (M2)",
    icon: Layers,
  },
  {
    id: "living" as const,
    label: "Backdrop TV & Wallpanel",
    icon: Tv,
  },
  {
    id: "bedroom" as const,
    label: "Kamar Tidur (Dipan/Rias)",
    icon: Bed,
  },
];

function buildInitialState(): CalculatorState {
  const state: CalculatorState = {};
  for (const item of ALL_ITEMS) {
    state[item.id] = {
      enabled: false,
      optionId: item.options[0]?.id ?? "",
      length: "",
      height: "",
      qty: "",
    };
  }
  return state;
}

/** Reusable custom dropdown for single-level options (Provinsi & Kota) */
function SimpleDropdown({
  value,
  options,
  onChange,
  className,
}: {
  value: string;
  options: Array<{ id: string; name: string }>;
  onChange: (newId: string) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.id === value) ?? options[0];

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "w-full flex items-center justify-between gap-2 text-left text-xs font-semibold rounded-xl border bg-surface-container-low px-3 py-2.5 text-on-surface shadow-2xs transition-all cursor-pointer",
          isOpen
            ? "border-primary ring-2 ring-primary/20 bg-surface"
            : "border-border-hairline hover:border-primary/60 hover:bg-surface"
        )}
      >
        <span className="truncate">{selectedOption?.name ?? "Pilih..."}</span>
        <ChevronDown
          className={cn(
            "size-3.5 text-on-surface-variant transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 w-full overflow-y-auto rounded-xl border border-border-hairline bg-surface shadow-xl divide-y divide-border-hairline/40 focus:outline-none overscroll-contain"
        >
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                type="button"
                role="option"
                key={opt.id}
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer",
                  isSelected
                    ? "bg-primary/10 text-primary font-bold"
                    : "hover:bg-surface-container-low text-on-surface font-medium"
                )}
              >
                <span className="truncate">{opt.name}</span>
                {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CostCalculator() {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("jabar");
  const [selectedCityId, setSelectedCityId] = useState<string>("kota-bandung");
  const [activeCategory, setActiveCategory] = useState<
    "kitchen" | "wardrobe" | "living" | "bedroom"
  >("kitchen");
  const [itemsState, setItemsState] = useState<CalculatorState>(buildInitialState);
  const [showAccessories, setShowAccessories] = useState(true);

  // Compute location and region
  const selectedProvince = useMemo(() => {
    return (
      PROVINCES_DATA.find((p) => p.id === selectedProvinceId) ?? PROVINCES_DATA[0]
    );
  }, [selectedProvinceId]);

  const availableCities = selectedProvince.cities;

  const selectedCity = useMemo(() => {
    return (
      availableCities.find((c) => c.id === selectedCityId) ?? availableCities[0]
    );
  }, [availableCities, selectedCityId]);

  // Determine DK vs LK automatically based on city
  const region: Region = selectedCity?.isDK ? "DK" : "LK";

  const handleProvinceChange = (newProvinceId: string) => {
    setSelectedProvinceId(newProvinceId);
    const prov =
      PROVINCES_DATA.find((p) => p.id === newProvinceId) ?? PROVINCES_DATA[0];
    if (prov.cities.length > 0) {
      setSelectedCityId(prov.cities[0].id);
    }
  };

  // Toggle item status
  const toggleItem = (itemId: string) => {
    setItemsState((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        enabled: !prev[itemId]?.enabled,
      },
    }));
  };

  // Update option selection
  const setOption = (itemId: string, optionId: string) => {
    setItemsState((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        optionId,
      },
    }));
  };

  // Adjust numeric dimensions
  const updateDimension = (
    itemId: string,
    field: "length" | "height" | "qty",
    delta: number,
    minVal: number = 0.5
  ) => {
    setItemsState((prev) => {
      const current = prev[itemId]?.[field];
      const numericCurrent = typeof current === "number" ? current : 0;
      let nextVal = Math.round((numericCurrent + delta) * 10) / 10;
      if (delta < 0 && nextVal < minVal) {
        nextVal = 0;
      } else if (delta > 0 && numericCurrent === 0) {
        nextVal = field === "qty" ? 1 : Math.max(1, minVal);
      }
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [field]: nextVal === 0 ? "" : nextVal,
        },
      };
    });
  };

  const setDirectDimension = (
    itemId: string,
    field: "length" | "height" | "qty",
    val: number | ""
  ) => {
    if (val !== "" && (isNaN(val) || val < 0)) return;
    setItemsState((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: val,
      },
    }));
  };

  // Reset to initial
  const handleReset = () => {
    setItemsState(buildInitialState());
  };

  // Calculate totals and breakdown
  const calculationSummary = useMemo(() => {
    let grandTotal = 0;
    let totalM1 = 0;
    let totalM2 = 0;
    let activeCount = 0;

    const activeBreakdown: Array<{
      item: FurnitureItemConfig;
      optionName: string;
      modelName: string;
      unitPrice: number;
      unit: string;
      measurement: number;
      subtotal: number;
    }> = [];

    for (const item of ALL_ITEMS) {
      const itemState = itemsState[item.id];
      if (!itemState || !itemState.enabled) continue;

      const option =
        item.options.find((opt) => opt.id === itemState.optionId) ?? item.options[0];
      if (!option) continue;

      const unitPrice = region === "DK" ? option.priceDK : option.priceLK;
      const len = typeof itemState.length === "number" ? itemState.length : 0;
      const ht = typeof itemState.height === "number" ? itemState.height : 0;
      const q = typeof itemState.qty === "number" ? itemState.qty : 0;

      let measurement = 0;
      let subtotal = 0;

      if (item.id === "meja_island") {
        measurement = len;
        subtotal = len > 0 ? Math.round((len / 0.6) * unitPrice) : 0;
        totalM1 += measurement;
      } else if (option.unit === "M1") {
        measurement = len;
        subtotal = measurement * unitPrice;
        totalM1 += measurement;
      } else if (option.unit === "M2") {
        measurement = Math.round(len * ht * 100) / 100;
        subtotal = measurement * unitPrice;
        totalM2 += measurement;
      } else {
        measurement = q;
        subtotal = measurement * unitPrice;
      }

      grandTotal += subtotal;
      activeCount += 1;

      activeBreakdown.push({
        item,
        optionName: option.name,
        modelName: option.model,
        unitPrice,
        unit: option.unit,
        measurement,
        subtotal,
      });
    }

    return {
      grandTotal,
      totalM1: Math.round(totalM1 * 10) / 10,
      totalM2: Math.round(totalM2 * 100) / 100,
      activeCount,
      activeBreakdown,
    };
  }, [itemsState, region]);

  // Construct WhatsApp URL
  const whatsAppUrl = useMemo(() => {
    const breakdownLines = calculationSummary.activeBreakdown.map((b, idx) => {
      const dimStr =
        b.item.id === "meja_island"
          ? `(${b.measurement} m : 0,6)`
          : b.unit === "M1"
            ? `${b.measurement} m1`
            : b.unit === "M2"
              ? `${b.measurement} m²`
              : `${b.measurement} unit`;
      return `${idx + 1}. ${b.item.name}\n   - Bahan: ${b.optionName} (${b.modelName})\n   - Ukuran: ${dimStr} x ${formatRupiah(b.unitPrice)} = ${formatRupiah(b.subtotal)}`;
    });

    const lines = [
      "Halo Niscala Furniture,",
      "",
      "Saya telah mencoba simulasi kalkulator estimasi biaya di website Niscala dengan rincian berikut:",
      `• Lokasi Pemasangan: ${selectedCity.name}, ${selectedProvince.name}`,
      `• Total Komponen: ${calculationSummary.activeCount} item`,
      "",
      "Rincian Item Pilihan:",
      ...breakdownLines,
      "",
      "--------------------------------------------------",
      `TOTAL ESTIMASI SEMENTARA: ${formatRupiah(calculationSummary.grandTotal)}`,
      "--------------------------------------------------",
      "",
      "Apakah bisa dijadwalkan survey lokasi dan konsultasi layout lebih lanjut?",
    ];

    return buildWhatsAppUrl({
      source: "calculator",
      message: lines.join("\n"),
    });
  }, [selectedCity, selectedProvince, calculationSummary]);

  const activeCategoryItems = useMemo(() => {
    if (activeCategory === "kitchen") {
      return KITCHEN_ITEMS;
    }
    return OTHER_CATEGORIES.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  // Compute selected count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<"kitchen" | "wardrobe" | "living" | "bedroom", number> = {
      kitchen: 0,
      wardrobe: 0,
      living: 0,
      bedroom: 0,
    };

    for (const item of KITCHEN_ITEMS) {
      if (itemsState[item.id]?.enabled) counts.kitchen += 1;
    }
    for (const item of ACCESSORIES_ITEMS) {
      if (itemsState[item.id]?.enabled) counts.kitchen += 1;
    }
    for (const item of OTHER_CATEGORIES) {
      if (itemsState[item.id]?.enabled) {
        if (item.category === "wardrobe") counts.wardrobe += 1;
        else if (item.category === "living") counts.living += 1;
        else if (item.category === "bedroom") counts.bedroom += 1;
      }
    }

    return counts;
  }, [itemsState]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header Panel & Location Picker */}
      <div className="rounded-3xl bg-surface-container border border-border-hairline p-6 sm:p-8 lg:p-10 mb-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="size-3.5" />
              Kalkulator Biaya Custom Transparan
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-on-surface tracking-tight">
              Simulasi Estimasi Biaya Furniture
            </h2>
            <p className="mt-2 text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
              Pilih lokasi pemasangan Anda dan kombinasikan komponen furniture yang Anda butuhkan.
              Tarif dihitung otomatis secara transparan sesuai area jangkauan workshop.
            </p>
          </div>

          {/* Location / Area Picker */}
          <div className="bg-surface rounded-2xl p-4 border border-border-hairline w-full lg:w-[380px] shrink-0 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface mb-2.5 px-0.5">
              <MapPin className="size-4 text-primary" />
              <span>Pilih Area Pemasangan:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Province Select */}
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                  Provinsi:
                </label>
                <SimpleDropdown
                  value={selectedProvinceId}
                  options={PROVINCES_DATA.map((prov) => ({ id: prov.id, name: prov.name }))}
                  onChange={handleProvinceChange}
                />
              </div>

              {/* City Select */}
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                  Kota / Kabupaten:
                </label>
                <SimpleDropdown
                  value={selectedCityId}
                  options={availableCities.map((city) => ({ id: city.id, name: city.name }))}
                  onChange={(newId) => setSelectedCityId(newId)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="mt-8 pt-6 border-t border-border-hairline flex flex-wrap gap-2 sm:gap-3">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            const count = categoryCounts[tab.id];
            const hasSelected = count > 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none",
                  isActive
                    ? "bg-primary text-white shadow-xs ring-1 ring-primary"
                    : hasSelected
                      ? "bg-surface text-on-surface border border-primary/40 shadow-2xs hover:bg-primary/5 ring-1 ring-primary/20 font-semibold"
                      : "bg-surface text-on-surface-variant hover:bg-surface-container-high border border-border-hairline"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive
                      ? "text-white"
                      : hasSelected
                        ? "text-primary"
                        : "text-on-surface-variant"
                  )}
                />
                <span>{tab.label}</span>

                {hasSelected && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold leading-none shrink-0 transition-all",
                      isActive
                        ? "bg-white text-primary shadow-xs"
                        : "bg-primary text-white shadow-xs"
                    )}
                  >
                    <Check className="size-2.5 stroke-[3]" />
                    <span>
                      {count}
                      <span className="hidden sm:inline"> item</span>
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Item Selectors (Left) + Live Sticky Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Component Cards */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-bold text-on-surface flex items-center gap-2">
              <span>Pilihan Komponen</span>
              <span className="text-xs font-sans font-normal px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant">
                Semua Opsional
              </span>
            </h3>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Simulasi</span>
            </button>
          </div>

          {/* Render Active Category Items */}
          <div className="space-y-4">
            {activeCategoryItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                region={region}
                state={itemsState[item.id]}
                onToggle={() => toggleItem(item.id)}
                onSelectOption={(optId) => setOption(item.id, optId)}
                onUpdateDimension={(field, delta, min) =>
                  updateDimension(item.id, field, delta, min)
                }
                onSetDirectDimension={(field, val) =>
                  setDirectDimension(item.id, field, val)
                }
              />
            ))}
          </div>

          {/* Kitchen Accessories Accordion (Only displayed when in Kitchen tab) */}
          {activeCategory === "kitchen" && (
            <div className="mt-8 rounded-2xl border border-border-hairline bg-surface-container-low overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAccessories((prev) => !prev)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-surface-container transition-colors"
              >
                <div>
                  <h4 className="text-base font-semibold text-on-surface flex items-center gap-2">
                    <span>Aksesoris & Fitting Tambahan Kitchen Set</span>
                    <span className="text-xs font-normal text-on-surface-variant">
                      (Sink, Lampu LED, Rak Piring, Rel Gas)
                    </span>
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Opsional untuk menambah kelengkapan dan kenyamanan dapur Anda.
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "size-5 text-on-surface-variant transition-transform duration-200",
                    showAccessories ? "rotate-180" : ""
                  )}
                />
              </button>

              {showAccessories && (
                <div className="p-4 sm:p-6 border-t border-border-hairline space-y-4 bg-surface">
                  {ACCESSORIES_ITEMS.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      region={region}
                      state={itemsState[item.id]}
                      onToggle={() => toggleItem(item.id)}
                      onSelectOption={(optId) => setOption(item.id, optId)}
                      onUpdateDimension={(field, delta, min) =>
                        updateDimension(item.id, field, delta, min)
                      }
                      onSetDirectDimension={(field, val) =>
                        setDirectDimension(item.id, field, val)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Educational Notes / Panduan Ukur */}
          <div className="rounded-2xl bg-surface-container-low border border-border-hairline p-5 sm:p-6 text-xs sm:text-sm text-on-surface-variant space-y-3">
            <div className="flex items-center gap-2 font-semibold text-on-surface">
              <Info className="size-4 text-primary" />
              <span>Cara Membaca Satuan Perhitungan:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 leading-relaxed">
              <li>
                <strong>Meter Lari (M1):</strong> Dihitung berdasarkan panjang
                bentangan furniture dengan kedalaman dan tinggi standar ergonomis
                (misal kabinet bawah tinggi ~85cm kedalaman ~60cm).
              </li>
              <li>
                <strong>Meter Persegi (M2):</strong> Dihitung berdasarkan luas bidang
                tampak depan (Panjang x Tinggi), cocok untuk lemari full-plafon atau
                backdrop panel dinding.
              </li>
              <li>
                <strong>Unit:</strong> Dihitung per buah atau per set aksesoris pelengkap
                dapur (sink, rak piring tarik, rel tabung gas).
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Sticky Live Summary */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="rounded-3xl bg-surface-container-high border-2 border-primary/20 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-hairline pb-4 mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Ringkasan Estimasi
                </span>
                <h4 className="text-lg font-serif font-bold text-on-surface">
                  Total Perkiraan Biaya
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {selectedCity.name}
              </span>
            </div>

            {/* Big Price Display */}
            <div className="mb-6">
              <div className="text-xs text-on-surface-variant mb-1 font-medium">
                Estimasi Total (Komponen Terpilih):
              </div>
              <div className="text-3xl sm:text-4xl font-serif font-black text-on-surface tracking-tight text-primary">
                {formatRupiah(calculationSummary.grandTotal)}
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-on-surface-variant">
                <span className="inline-flex items-center gap-1 font-medium bg-surface px-2.5 py-1 rounded-md border border-border-hairline">
                  <strong>{calculationSummary.activeCount}</strong> Item Aktif
                </span>
                {calculationSummary.totalM1 > 0 && (
                  <span className="inline-flex items-center gap-1 bg-surface px-2.5 py-1 rounded-md border border-border-hairline">
                    <strong>{calculationSummary.totalM1}</strong> M1 Lari
                  </span>
                )}
                {calculationSummary.totalM2 > 0 && (
                  <span className="inline-flex items-center gap-1 bg-surface px-2.5 py-1 rounded-md border border-border-hairline">
                    <strong>{calculationSummary.totalM2}</strong> m² Persegi
                  </span>
                )}
              </div>
            </div>

            {/* Item Breakdown List */}
            <div className="border-t border-border-hairline pt-4 mb-6">
              <div className="text-xs font-semibold text-on-surface mb-3 flex items-center justify-between">
                <span>Rincian Komponen Terpilih</span>
                <span className="text-primary font-bold">Subtotal</span>
              </div>

              {calculationSummary.activeBreakdown.length === 0 ? (
                <div className="py-6 text-center text-xs text-on-surface-variant italic bg-surface/50 rounded-xl border border-dashed border-border-hairline">
                  Belum ada komponen yang dicentang. Centang komponen di sebelah kiri
                  untuk melihat simulasi.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs">
                  {calculationSummary.activeBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-surface border border-border-hairline flex flex-col gap-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-on-surface line-clamp-1">
                          {item.item.name}
                        </span>
                        <span className="font-bold text-on-surface whitespace-nowrap">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span>{item.optionName}</span>
                        <span>
                          {item.item.id === "meja_island" ? (
                            `(${item.measurement} m : 0,6) x ${formatRupiah(item.unitPrice)}`
                          ) : (
                            <>
                              {item.unit === "M1" && `${item.measurement} m1`}
                              {item.unit === "M2" && `${item.measurement} m²`}
                              {item.unit === "UNIT" && `${item.measurement} unit`}
                              {" x "}
                              {formatRupiah(item.unitPrice)}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              {whatsAppUrl ? (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("whatsapp_click", { source: "calculator" })}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm"
                >
                  <MessageCircle className="size-4.5" />
                  <span>Konsultasikan via WhatsApp</span>
                </a>
              ) : (
                <Link
                  href="/survey"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-container hover:text-on-primary-container transition-all"
                >
                  <span>Ajukan Survey Lokasi</span>
                  <ArrowRight className="size-4" />
                </Link>
              )}

              <Link
                href="/survey"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-surface text-on-surface hover:bg-surface-container border border-border-hairline text-xs font-semibold transition-all"
              >
                <span>Jadwalkan Survey Gratis ke Lokasi</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* Workshop Guarantees note */}
            <div className="mt-6 pt-4 border-t border-border-hairline flex items-center gap-3 text-xs text-on-surface-variant">
              <ShieldCheck className="size-5 text-primary shrink-0" />
              <p className="leading-tight">
                Garansi struktur 1 tahun, aksesoris soft-close, dan pengerjaan presisi
                di workshop sendiri.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Individual Item Card Component */
type ItemCardProps = {
  item: FurnitureItemConfig;
  region: Region;
  state?: ItemState;
  onToggle: () => void;
  onSelectOption: (optId: string) => void;
  onUpdateDimension: (
    field: "length" | "height" | "qty",
    delta: number,
    minVal?: number
  ) => void;
  onSetDirectDimension: (
    field: "length" | "height" | "qty",
    val: number | ""
  ) => void;
};

function ItemCard({
  item,
  region,
  state,
  onToggle,
  onSelectOption,
  onUpdateDimension,
  onSetDirectDimension,
}: ItemCardProps) {
  const isEnabled = state?.enabled ?? false;
  const selectId = useId();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDropdownOpen) return;
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const selectedOption =
    item.options.find((opt) => opt.id === state?.optionId) ?? item.options[0];
  const unitPrice = selectedOption
    ? region === "DK"
      ? selectedOption.priceDK
      : selectedOption.priceLK
    : 0;

  let subtotal = 0;
  if (state && selectedOption) {
    const len = typeof state.length === "number" ? state.length : 0;
    const ht = typeof state.height === "number" ? state.height : 0;
    const q = typeof state.qty === "number" ? state.qty : 0;

    if (item.id === "meja_island") {
      subtotal = len > 0 ? Math.round((len / 0.6) * unitPrice) : 0;
    } else if (selectedOption.unit === "M1") {
      subtotal = len * unitPrice;
    } else if (selectedOption.unit === "M2") {
      subtotal = len * ht * unitPrice;
    } else {
      subtotal = q * unitPrice;
    }
  }

  const groupedOptions = useMemo(() => {
    const groups: Array<{ groupName: string; options: typeof item.options }> = [];
    for (const opt of item.options) {
      const existing = groups.find((g) => g.groupName === opt.name);
      if (existing) {
        existing.options.push(opt);
      } else {
        groups.push({ groupName: opt.name, options: [opt] });
      }
    }
    return groups;
  }, [item]);

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200",
        isDropdownOpen && "relative z-30",
        isEnabled
          ? "bg-surface border-primary/40 shadow-xs ring-1 ring-primary/20"
          : "bg-surface-container-lowest border-border-hairline opacity-80 hover:opacity-100"
      )}
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4">
        <label className="flex items-start sm:items-center gap-3.5 cursor-pointer select-none flex-1">
          <div className="pt-0.5 sm:pt-0">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={onToggle}
              className="size-5 rounded-md border-border-hairline-strong text-primary focus:ring-primary accent-primary cursor-pointer"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm sm:text-base text-on-surface">
                {item.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant border border-border-hairline">
                {item.id === "meja_island"
                  ? "Rumus Khusus: (P : 0,6) x Tarif"
                  : item.defaultUnit === "M1"
                    ? "Meter Lari (M1)"
                    : item.defaultUnit === "M2"
                      ? "Meter Persegi (M2)"
                      : "Per Unit"}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              {item.description}
            </p>
          </div>
        </label>

        <div className="text-right shrink-0">
          <div className="text-xs text-on-surface-variant">Subtotal</div>
          <div
            className={cn(
              "text-sm sm:text-base font-bold",
              isEnabled ? "text-primary" : "text-on-surface-variant line-through"
            )}
          >
            {formatRupiah(subtotal)}
          </div>
        </div>
      </div>

      {/* Expanded Controls when Item is Enabled */}
      {isEnabled && (
        <div className="px-4 pb-5 pt-1 sm:px-5 border-t border-border-hairline/60 bg-surface-container-lowest/50 rounded-b-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-3">
            {/* Material & Model Selector */}
            <div className="sm:col-span-7">
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <label
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="block text-xs font-semibold text-on-surface-variant cursor-pointer"
                >
                  Pilihan Bahan Utama & Model:
                </label>
                {item.options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  >
                    <span>{item.options.length} pilihan bahan</span>
                    <ChevronDown className={cn("size-3 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                  </button>
                )}
              </div>

              <div className="relative" ref={dropdownRef}>
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
                  title="Klik untuk memilih bahan dan model"
                >
                  <div className="min-w-0 flex-1">
                    {selectedOption ? (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 leading-tight">
                        <span className="font-semibold text-xs sm:text-sm truncate">
                          {selectedOption.name}{" "}
                          <span className="text-on-surface-variant font-normal">— {selectedOption.model}</span>
                        </span>
                        <span className="text-[11px] sm:text-xs font-bold text-primary shrink-0 mt-0.5 sm:mt-0">
                          ({formatRupiah(region === "DK" ? selectedOption.priceDK : selectedOption.priceLK)} / {selectedOption.unit})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-on-surface-variant">Pilih bahan & model...</span>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-4 text-on-surface-variant transition-transform duration-200 shrink-0",
                      isDropdownOpen && "rotate-180 text-primary"
                    )}
                  />
                </button>

                {/* Custom Responsive Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-72 sm:max-h-80 w-full overflow-y-auto rounded-2xl border border-border-hairline bg-surface shadow-2xl divide-y divide-border-hairline/40 focus:outline-none overscroll-contain"
                  >
                    {groupedOptions.map(({ groupName, options }) => {
                      const showHeader = groupedOptions.length > 1;

                      return (
                        <div key={groupName} className="py-0.5">
                          {showHeader && (
                            <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-gray bg-surface-container-low/90 sticky top-0 backdrop-blur-md z-10 flex items-center justify-between border-b border-border-hairline/30 mb-0.5">
                              <span>{groupName}</span>
                              <span className="font-medium text-[10px] lowercase text-on-surface-variant/70">
                                {options.length} model
                              </span>
                            </div>
                          )}

                          {options.map((opt) => {
                            const isSelected = opt.id === state?.optionId;
                            const price = region === "DK" ? opt.priceDK : opt.priceLK;

                            return (
                              <button
                                type="button"
                                role="option"
                                key={opt.id}
                                aria-selected={isSelected}
                                onClick={() => {
                                  onSelectOption(opt.id);
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
                                      {opt.model}
                                    </span>
                                    {!showHeader && (
                                      <span className="text-on-surface-variant font-normal text-[11px] sm:text-xs ml-1">
                                        ({opt.name})
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] sm:text-xs font-bold text-primary mt-0.5">
                                    {formatRupiah(price)}{" "}
                                    <span className="font-normal text-on-surface-variant">
                                      / {opt.unit}
                                    </span>
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="size-5 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                                    <Check className="size-3 stroke-[3]" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Dimension Inputs */}
            <div className="sm:col-span-5">
              {item.defaultUnit === "M1" && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant mb-1">
                    <span>{item.id === "meja_island" ? "Panjang Meja:" : "Panjang Bentang:"}</span>
                    <span className="text-primary font-bold">
                      {state?.length
                        ? item.id === "meja_island"
                          ? `${state.length} m (${state.length} : 0,6)`
                          : `${state.length} Meter Lari (M1)`
                        : "Belum diisi (0 M1)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateDimension("length", -0.5, 0.5)}
                      className="size-9 rounded-xl border border-border-hairline bg-surface hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
                      title="Kurangi 0.5 meter"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      value={state?.length ?? ""}
                      onChange={(e) =>
                        onSetDirectDimension(
                          "length",
                          e.target.value === "" ? "" : parseFloat(e.target.value)
                        )
                      }
                      className="flex-1 text-center font-bold text-sm rounded-xl border border-border-hairline bg-surface py-1.5 text-on-surface focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => onUpdateDimension("length", 0.5, 0.5)}
                      className="size-9 rounded-xl border border-border-hairline bg-surface hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
                      title="Tambah 0.5 meter"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  {item.id === "meja_island" && (
                    <div className="text-[11px] text-on-surface-variant mt-1.5 flex items-center justify-between">
                      <span>Rumus workshop:</span>
                      <span className="font-semibold text-primary">
                        (Panjang : 0,6) &times; Tarif
                      </span>
                    </div>
                  )}
                </div>
              )}

              {item.defaultUnit === "M2" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                    <span>Dimensi Luas (M2):</span>
                    <span className="text-primary font-bold">
                      {typeof state?.length === "number" &&
                      typeof state?.height === "number" &&
                      state.length > 0 &&
                      state.height > 0
                        ? `${Math.round(state.length * state.height * 100) / 100} m²`
                        : "Belum diisi (0 m²)"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[11px] text-on-surface-variant mb-0.5">Panjang (m)</div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="0"
                          value={state?.length ?? ""}
                          onChange={(e) =>
                            onSetDirectDimension(
                              "length",
                              e.target.value === "" ? "" : parseFloat(e.target.value)
                            )
                          }
                          className="w-full text-center font-bold text-xs rounded-lg border border-border-hairline bg-surface py-1.5 text-on-surface"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-on-surface-variant mb-0.5">Tinggi (m)</div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="0"
                          value={state?.height ?? ""}
                          onChange={(e) =>
                            onSetDirectDimension(
                              "height",
                              e.target.value === "" ? "" : parseFloat(e.target.value)
                            )
                          }
                          className="w-full text-center font-bold text-xs rounded-lg border border-border-hairline bg-surface py-1.5 text-on-surface"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {item.defaultUnit === "UNIT" && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant mb-1">
                    <span>Jumlah / Qty:</span>
                    <span className="text-primary font-bold">
                      {state?.qty ? `${state.qty} Unit` : "Belum diisi (0 Unit)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateDimension("qty", -1, 1)}
                      className="size-9 rounded-xl border border-border-hairline bg-surface hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
                      title="Kurangi 1 unit"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={state?.qty ?? ""}
                      onChange={(e) =>
                        onSetDirectDimension(
                          "qty",
                          e.target.value === "" ? "" : parseInt(e.target.value, 10)
                        )
                      }
                      className="flex-1 text-center font-bold text-sm rounded-xl border border-border-hairline bg-surface py-1.5 text-on-surface focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => onUpdateDimension("qty", 1, 1)}
                      className="size-9 rounded-xl border border-border-hairline bg-surface hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
                      title="Tambah 1 unit"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
