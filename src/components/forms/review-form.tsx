"use client";

import { useState, useTransition } from "react";
import { Star, CheckCircle2, MessageSquarePlus, Send, AlertCircle, X } from "lucide-react";

import { submitReviewAction, type SubmitReviewResult } from "@/app/actions/submit-review";
import { Button } from "@/components/ui/button";
import { controlClasses } from "@/components/forms/fields";
import { cn } from "@/lib/cn";

const RATING_LABELS: Record<number, string> = {
  1: "1 - Kurang Puas",
  2: "2 - Cukup",
  3: "3 - Baik",
  4: "4 - Puas",
  5: "5 - Sangat Puas!",
};

export function ReviewForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SubmitReviewResult | null>(null);

  const activeRating = hoverRating ?? rating;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("rating", rating.toString());

    startTransition(async () => {
      const res = await submitReviewAction(formData);
      setResult(res);
      if (res.success) {
        form.reset();
        setRating(5);
      }
    });
  };

  if (!isOpen) {
    return (
      <div className="flex items-center justify-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-2 border-primary-container bg-surface-container-lowest text-on-surface hover:bg-primary-container hover:text-deep-black"
        >
          <MessageSquarePlus className="size-4 text-primary-container" />
          <span>Beri Ulasan / Saran</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-space-lg overflow-hidden rounded-xl border border-border-hairline-strong bg-surface-container-lowest p-space-md shadow-sm sm:p-space-xl">
      <div className="flex items-center justify-between border-b border-border-hairline-strong pb-space-sm">
        <div>
          <h3 className="text-label-lg font-bold text-on-surface sm:text-title-md">
            Kirimkan Ulasan, Saran, atau Kritik Anda
          </h3>
          <p className="text-body-sm text-muted-gray">
            Masukan Anda sangat berharga untuk terus menyempurnakan karya dan layanan kami.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setResult(null);
          }}
          className="rounded-full p-1.5 text-muted-gray transition-colors hover:bg-surface-container-high hover:text-on-surface"
          aria-label="Tutup formulir ulasan"
        >
          <X className="size-5" />
        </button>
      </div>

      {result?.success ? (
        <div className="py-space-xl text-center">
          <div className="mx-auto mb-space-sm flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="size-7" />
          </div>
          <h4 className="text-label-lg font-bold text-on-surface">Ulasan Berhasil Terkirim</h4>
          <p className="mx-auto mt-1 max-w-md text-body-sm text-muted-gray">
            {result.message}
          </p>
          <div className="mt-space-md flex items-center justify-center gap-space-sm">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResult(null)}
            >
              Tulis Ulasan Lain
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setResult(null);
              }}
            >
              Selesai
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-space-md space-y-space-md">
          {result && !result.success ? (
            <div className="flex items-start gap-space-xs rounded-lg border border-red-200 bg-red-50 p-space-sm text-body-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-semibold">{result.error}</p>
              </div>
            </div>
          ) : null}

          {/* Rating Bintang */}
          <div className="space-y-space-2xs">
            <label className="block text-label-md font-semibold text-on-surface">
              Rating Kepuasan <span className="text-error">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-space-sm">
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverRating(null)}
                role="radiogroup"
                aria-label="Pilih rating bintang dari 1 sampai 5"
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="group p-1 transition-transform hover:scale-110 focus:outline-none"
                      aria-label={`Beri ${star} bintang`}
                      role="radio"
                      aria-checked={rating === star}
                    >
                      <Star
                        className={cn(
                          "size-6 transition-colors sm:size-7",
                          isFilled
                            ? "fill-primary-container text-primary-container"
                            : "fill-transparent text-border-hairline-strong group-hover:text-primary-container"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-label-md font-medium text-primary-container-hover">
                {RATING_LABELS[activeRating]}
              </span>
            </div>
          </div>

          {/* Input Nama & Alamat */}
          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
            <div className="space-y-space-2xs">
              <label htmlFor="review-name" className="block text-label-md font-semibold text-on-surface">
                Nama Lengkap / Panggilan <span className="text-error">*</span>
              </label>
              <input
                id="review-name"
                name="name"
                type="text"
                required
                placeholder="Contoh: Ibu Rina Paramita"
                className={controlClasses}
                disabled={isPending}
              />
              {result && !result.success && result.fieldErrors?.name ? (
                <p className="text-body-sm text-error">{result.fieldErrors.name}</p>
              ) : null}
            </div>

            <div className="space-y-space-2xs">
              <label htmlFor="review-address" className="block text-label-md font-semibold text-on-surface">
                Alamat / Kota / Wilayah <span className="text-error">*</span>
              </label>
              <input
                id="review-address"
                name="address"
                type="text"
                required
                placeholder="Contoh: Bandung atau Jakarta Selatan"
                className={controlClasses}
                disabled={isPending}
              />
              {result && !result.success && result.fieldErrors?.address ? (
                <p className="text-body-sm text-error">{result.fieldErrors.address}</p>
              ) : null}
            </div>
          </div>

          {/* Input Email (Private / Developer Data Only) */}
          <div className="space-y-space-2xs">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label htmlFor="review-email" className="block text-label-md font-semibold text-on-surface">
                Alamat Email <span className="text-error">*</span>
              </label>
              <span className="text-[11px] font-medium text-muted-gray">
                🔒 Privat (tidak dipublikasikan, hanya untuk data developer/internal)
              </span>
            </div>
            <input
              id="review-email"
              name="email"
              type="email"
              required
              placeholder="Contoh: nama@email.com"
              className={controlClasses}
              disabled={isPending}
            />
            {result && !result.success && result.fieldErrors?.email ? (
              <p className="text-body-sm text-error">{result.fieldErrors.email}</p>
            ) : null}
          </div>

          {/* Textarea Saran / Kritik / Ulasan */}
          <div className="space-y-space-2xs">
            <label htmlFor="review-desc" className="block text-label-md font-semibold text-on-surface">
              Ulasan, Saran, atau Kritik <span className="text-error">*</span>
            </label>
            <textarea
              id="review-desc"
              name="description"
              rows={4}
              required
              placeholder="Ceritakan pengalaman Anda bekerja sama dengan tim Niscala, atau sampaikan kritik dan saran untuk perbaikan kami ke depan..."
              className={cn(controlClasses, "resize-y")}
              disabled={isPending}
            />
            {result && !result.success && result.fieldErrors?.description ? (
              <p className="text-body-sm text-error">{result.fieldErrors.description}</p>
            ) : null}
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-end gap-space-sm pt-space-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending}
              className="min-w-36 gap-2"
            >
              {isPending ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-deep-black border-t-transparent" />
                  <span>Mengirimkan...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Kirim Ulasan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
