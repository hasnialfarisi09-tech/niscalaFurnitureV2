import fs from "fs/promises";
import path from "path";

export type PublicReview = {
  id: string;
  author: string;
  address: string;
  rating: number; // 1 to 5
  description: string;
  createdAt: string;
  isPublic: boolean;
};

const REVIEWS_FILE_PATH = path.join(process.cwd(), "src", "data", "public-reviews.json");

/**
 * Reads public reviews stored on filesystem.
 */
export async function getPublicReviews(): Promise<PublicReview[]> {
  try {
    const data = await fs.readFile(REVIEWS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((r) => r && r.isPublic !== false);
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "ENOENT"
    ) {
      try {
        await fs.writeFile(REVIEWS_FILE_PATH, JSON.stringify([], null, 2), "utf-8");
      } catch {
        // ignore write error
      }
    }
    return [];
  }
}

/**
 * Writes public reviews atomically to filesystem.
 */
async function writeReviews(reviews: PublicReview[]): Promise<void> {
  const dir = path.dirname(REVIEWS_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });

  const tempPath = `${REVIEWS_FILE_PATH}.${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(reviews, null, 2), "utf-8");
  await fs.rename(tempPath, REVIEWS_FILE_PATH);
}

/**
 * Saves a new public review.
 */
export async function savePublicReview(input: {
  author: string;
  address: string;
  rating: number;
  description: string;
}): Promise<{ success: boolean; error?: string; review?: PublicReview }> {
  try {
    const existing = await getPublicReviews();

    const newReview: PublicReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      author: input.author.trim(),
      address: input.address.trim(),
      rating: Math.max(1, Math.min(5, Math.round(input.rating))),
      description: input.description.trim(),
      createdAt: new Date().toISOString(),
      isPublic: true,
    };

    // Prepend so newest reviews appear first
    const updated = [newReview, ...existing];
    await writeReviews(updated);

    return { success: true, review: newReview };
  } catch (error) {
    console.error("[reviews] Failed to save review:", error);
    return {
      success: false,
      error: "Gagal menyimpan ulasan ke server. Silakan coba lagi.",
    };
  }
}
