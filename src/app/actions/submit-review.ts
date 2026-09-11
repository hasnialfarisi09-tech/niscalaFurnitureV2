"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { savePublicReview } from "@/lib/reviews";

const reviewSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama wajib diisi (minimal 2 karakter).")
    .max(80, "Nama maksimal 80 karakter."),
  address: z
    .string()
    .trim()
    .min(2, "Alamat / kota wajib diisi (minimal 2 karakter).")
    .max(100, "Alamat / kota maksimal 100 karakter."),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating minimal 1 bintang.")
    .max(5, "Rating maksimal 5 bintang."),
  description: z
    .string()
    .trim()
    .min(5, "Deskripsi ulasan, kritik, atau saran minimal 5 karakter.")
    .max(1000, "Deskripsi maksimal 1000 karakter."),
});

export type SubmitReviewResult =
  | { success: true; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function submitReviewAction(
  formData: FormData
): Promise<SubmitReviewResult> {
  const raw = {
    name: formData.get("name"),
    address: formData.get("address"),
    rating: formData.get("rating"),
    description: formData.get("description"),
  };

  const parsed = reviewSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }

    return {
      success: false,
      error: "Mohon lengkapi formulir ulasan dengan benar.",
      fieldErrors,
    };
  }

  const result = await savePublicReview({
    author: parsed.data.name,
    address: parsed.data.address,
    rating: parsed.data.rating,
    description: parsed.data.description,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error || "Gagal mengirimkan ulasan. Silakan coba lagi.",
    };
  }

  revalidatePath("/");
  return {
    success: true,
    message: "Terima kasih atas ulasan dan masukan Anda! Ulasan Anda telah berhasil disimpan.",
  };
}
