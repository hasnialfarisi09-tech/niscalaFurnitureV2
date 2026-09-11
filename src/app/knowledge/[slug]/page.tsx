import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

import { Eyebrow } from "@/components/ui/typography";
import { ProjectCard } from "@/components/ui/project-card";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { FormattedText } from "@/components/ui/formatted-text";
import {
  articleSeoTitle,
} from "@/data/knowledge";
import { projects } from "@/data/projects";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import {
  ORGANISATION_ID,
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";
import { site } from "@/lib/site";
import type { KnowledgeArticle } from "@/types";

/**
 * Dynamic params enabled so newly published articles from the admin panel
 * are resolved and rendered on demand without requiring a redeploy.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata(props: PageProps<"/knowledge/[slug]">) {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return buildMetadata({
      title: "Artikel tidak ditemukan",
      description: "Panduan yang Anda cari tidak tersedia.",
      path: `/knowledge/${slug}`,
    });
  }

  return buildMetadata({
    title: articleSeoTitle(article),
    description: article.summary,
    path: `/knowledge/${article.slug}`,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
  });
}

/** "2026-01-15" -> "15 Januari 2026". */
function formatArticleDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function articleGraph(article: KnowledgeArticle) {
  const path = `/knowledge/${article.slug}`;
  const url = absoluteUrl(path);

  return jsonLdGraph(
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: articleSeoTitle(article),
      alternativeHeadline: article.title,
      description: article.summary,
      articleSection: article.category,
      datePublished: article.publishedAt,
      // Emitted only when the article has genuinely been revised: a
      // dateModified that tracks the build would be a freshness claim the
      // content does not back up.
      ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
      wordCount: countWords(article),
      timeRequired: `PT${article.readingMinutes}M`,
      inLanguage: "id-ID",
      author: { "@id": ORGANISATION_ID },
      publisher: { "@id": ORGANISATION_ID },
      isPartOf: { "@id": `${url}#webpage` },
      mainEntityOfPage: { "@id": `${url}#webpage` },
    },
    webPageJsonLd({
      path,
      name: articleSeoTitle(article),
      description: article.summary,
      breadcrumb: true,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
    }),
    breadcrumbJsonLd([
      { name: "Panduan", path: "/knowledge" },
      { name: article.category, path },
    ])
  );
}

/** Rough word count over the typed body blocks, for Article structured data. */
function countWords(article: KnowledgeArticle): number {
  const text = article.body
    .map((block) => {
      switch (block.type) {
        case "paragraph":
        case "heading":
          return block.text;
        case "list":
          return block.items.join(" ");
        case "callout":
          return `${block.title} ${block.text}`;
      }
    })
    .join(" ");

  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Returns thumbnail image for an article.
 * Prioritizes the first image block in the article body, then falls back to contextual photography.
 */
function getArticleThumbnail(art: KnowledgeArticle): { src: string; alt: string } {
  const imageBlock = art.body.find(
    (b): b is { type: "image"; src: string; alt: string; caption?: string } =>
      b.type === "image" && Boolean(b.src)
  );

  if (imageBlock?.src) {
    return {
      src: imageBlock.src,
      alt: imageBlock.alt || art.title,
    };
  }

  const text = `${art.slug} ${art.category} ${art.title}`.toLowerCase();
  if (text.includes("kitchen") || text.includes("dapur") || text.includes("masak")) {
    return { src: "/images/portfolio/kitchen-set/modern-01.webp", alt: art.title };
  }
  if (text.includes("wardrobe") || text.includes("lemari") || text.includes("closet") || text.includes("pakaian")) {
    return { src: "/images/portfolio/wardrobe/wardrobe-2024-07-01.webp", alt: art.title };
  }
  if (text.includes("tangga") || text.includes("gudang")) {
    return { src: "/images/portfolio/lemari-bawah-tangga/andri-padalarang-01.webp", alt: art.title };
  }
  if (text.includes("apartemen") || text.includes("studio")) {
    return { src: "/images/portfolio/apartemen/ibu-finta-jakarta-selatan-01.webp", alt: art.title };
  }
  if (text.includes("tv") || text.includes("backdrop") || text.includes("living") || text.includes("keluarga")) {
    return { src: "/images/portfolio/tv-backdrop/tv-backdrop-01.webp", alt: art.title };
  }
  if (text.includes("kerja") || text.includes("meja") || text.includes("kamar") || text.includes("bedroom")) {
    return { src: "/images/portfolio/bedroom/bedroom-02.webp", alt: art.title };
  }

  return { src: "/images/portfolio/before-after/before-after-01.webp", alt: art.title };
}

export default async function ArticlePage(props: PageProps<"/knowledge/[slug]">) {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const allArticles = await getAllArticles();

  // Select up to 4 other articles, prioritizing same category first, then other categories
  const sameCategoryOthers = allArticles.filter(
    (item) =>
      item.slug !== article.slug &&
      item.category.trim().toLowerCase() === article.category.trim().toLowerCase()
  );
  const differentCategoryOthers = allArticles.filter(
    (item) =>
      item.slug !== article.slug &&
      item.category.trim().toLowerCase() !== article.category.trim().toLowerCase()
  );
  const others = [...sameCategoryOthers, ...differentCategoryOthers].slice(0, 4);

  // Select 4 relevant projects (prioritize category or location match)
  const matchingProjects = projects.filter((p) => {
    const catMatch =
      article.category.toLowerCase().includes(p.categoryShort.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(article.category.toLowerCase());
    const locMatch =
      Boolean(p.location && article.category.toLowerCase().includes(p.location.toLowerCase()));
    return catMatch || locMatch;
  });

  const featuredProjects = [
    ...matchingProjects,
    ...projects.filter((p) => !matchingProjects.some((m) => m.slug === p.slug)),
  ].slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(articleGraph(article))}
      />

      <article className="bg-surface py-space-3xl lg:py-space-4xl">
        <div className="container-editorial">
          <Link
            href="/knowledge"
            className="group inline-flex items-center gap-space-2xs text-label-md font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform group-hover:-translate-x-0.5"
            />
            Semua panduan
          </Link>

          <header className="mx-auto mt-space-lg max-w-3xl space-y-space-sm">
            <Eyebrow>{article.category}</Eyebrow>
            <h1 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              {article.title}
            </h1>
            <p className="text-body-lg leading-relaxed text-on-surface-variant">
              {article.summary}
            </p>
            {/*
              Author and dates are on the page, not just in the markup: this is
              the byline a reader (and an E-E-A-T assessment) looks for.
            */}
            <div className="flex flex-wrap items-center gap-x-space-md gap-y-space-2xs text-label-md text-muted-gray">
              <span>
                Ditulis oleh{" "}
                <span className="font-semibold text-on-surface-variant">
                  Tim Teknis {site.name}
                </span>
              </span>
              <span aria-hidden>&bull;</span>
              <span>
                {article.updatedAt ? "Diperbarui" : "Dipublikasikan"}{" "}
                <time dateTime={article.updatedAt ?? article.publishedAt}>
                  {formatArticleDate(article.updatedAt ?? article.publishedAt)}
                </time>
              </span>
              <span aria-hidden>&bull;</span>
              <span className="inline-flex items-center gap-space-2xs">
                <Clock aria-hidden className="size-4" />
                {article.readingMinutes} menit baca
              </span>
            </div>
          </header>

          <div className="mx-auto mt-space-2xl max-w-3xl space-y-space-lg">
            {article.body.map((block, index) => {
              switch (block.type) {
                case "heading":
                  return (
                    <h2
                      key={index}
                      className="pt-space-md text-headline-md-mobile text-on-surface lg:text-headline-md"
                    >
                      {block.text}
                    </h2>
                  );
                case "paragraph":
                  return (
                    <p
                      key={index}
                      className="text-body-lg leading-relaxed text-on-surface-variant"
                    >
                      <FormattedText text={block.text} />
                    </p>
                  );
                case "list":
                  return (
                    <ul key={index} className="space-y-space-xs">
                      {block.items.map((item) => (
                        <li
                          key={item}
                          className="flex gap-space-sm text-body-md leading-relaxed text-on-surface-variant"
                        >
                          <span
                            aria-hidden
                            className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary-container"
                          />
                          <FormattedText text={item} />
                        </li>
                      ))}
                    </ul>
                  );
                case "callout":
                  return (
                    <aside
                      key={index}
                      className="space-y-space-2xs rounded-md border-l-2 border-primary-container bg-surface-container-low p-space-lg"
                    >
                      <p className="text-label-lg font-semibold text-on-surface">
                        {block.title}
                      </p>
                      <p className="text-body-md leading-relaxed text-on-surface-variant">
                        <FormattedText text={block.text} />
                      </p>
                    </aside>
                  );
                case "image":
                  return (
                    <figure key={index} className="my-space-xl space-y-2">
                      <img
                        src={block.src}
                        alt={block.alt || "Gambar panduan Niscala"}
                        className="w-full rounded-xl object-cover shadow-sm max-h-[520px] bg-surface-container-low"
                        loading="lazy"
                      />
                      {block.caption ? (
                        <figcaption className="text-center text-label-sm text-muted-gray">
                          {block.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  );
                case "video": {
                  const videoId =
                    block.videoId ||
                    (block.url
                      ? block.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i)?.[1]
                      : null);
                  return (
                    <div
                      key={index}
                      className="my-space-xl overflow-hidden rounded-xl border border-border-hairline bg-surface-container-lowest shadow-sm"
                    >
                      <div className="relative aspect-video w-full bg-deep-black">
                        {videoId ? (
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                            title={block.title || "Video Panduan Niscala Furniture"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute inset-0 h-full w-full border-0"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-gray">
                            Link video YouTube tidak valid
                          </div>
                        )}
                      </div>
                      {block.title ? (
                        <div className="p-space-sm text-center text-label-sm text-muted-gray bg-surface-container-low border-t border-border-hairline/60">
                          {block.title}
                        </div>
                      ) : null}
                    </div>
                  );
                }
              }
            })}
          </div>

          <div className="mx-auto mt-space-3xl max-w-3xl rounded-md bg-surface-container-low p-space-xl">
            <div className="flex flex-col items-start justify-between gap-space-md sm:flex-row sm:items-center">
              <div className="space-y-1">
                <p className="text-headline-sm font-semibold text-on-surface">
                  Masih ragu menentukan pilihan?
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Kirimkan kondisi ruangan Anda, kami bantu rekomendasikan yang
                  paling masuk akal.
                </p>
              </div>
              <WhatsAppCta
                source="faq"
                className="shrink-0"
                context={`Saya membaca panduan: ${article.title}.`}
              >
                Tanya Tim Teknis
              </WhatsAppCta>
            </div>
          </div>
        </div>
      </article>

      {/* Portofolio Showcase: 4 Cards + Lihat Semua Portofolio */}
      {featuredProjects.length > 0 ? (
        <section className="border-t border-border-hairline bg-surface py-space-4xl">
          <div className="container-editorial">
            <div className="mb-space-2xl space-y-space-2xs text-center sm:text-left">
              <Eyebrow>Karya Nyata Niscala</Eyebrow>
              <h2 className="text-headline-md-mobile text-on-surface lg:text-headline-md">
                Portofolio Pengerjaan Terkait
              </h2>
              <p className="max-w-2xl text-body-md text-on-surface-variant">
                Lihat bagaimana standar presisi, material tahan lembab, dan kerapian instalasi kami diwujudkan langsung di hunian klien.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-space-sm sm:gap-gutter-desktop lg:grid-cols-4">
              {featuredProjects.map((proj) => (
                <ProjectCard
                  key={proj.slug}
                  project={proj}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
                />
              ))}
            </div>

            <div className="mt-space-2xl text-center">
              <Link
                href="/portfolio"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-label-lg font-semibold text-on-primary shadow-hairline transition-all hover:bg-primary-hover active:translate-y-px"
              >
                <span>Lihat Semua Portofolio</span>
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {others.length > 0 ? (
        <section className="border-t border-border-hairline bg-surface-container-low py-space-4xl">
          <div className="container-editorial">
            <div className="mb-space-2xl space-y-space-2xs text-center sm:text-left">
              <Eyebrow>Wawasan Terkait</Eyebrow>
              <h2 className="text-headline-md-mobile text-on-surface lg:text-headline-md">
                Panduan lainnya
              </h2>
              <p className="max-w-2xl text-body-md text-on-surface-variant">
                Pelajari tips perencanaan interior, perbandingan material, dan panduan teknis lainnya untuk hunian Anda.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-space-sm sm:gap-gutter-desktop lg:grid-cols-4">
              {others.map((item) => {
                const thumb = getArticleThumbnail(item);
                return (
                  <article key={item.slug} className="flex h-full">
                    <Link
                      href={`/knowledge/${item.slug}`}
                      className="group flex h-full w-full flex-col overflow-hidden rounded-md border border-border-hairline bg-surface-container-lowest shadow-hairline transition-all hover:border-primary/40 hover:shadow-panel"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container-high">
                        <img
                          src={thumb.src}
                          alt={thumb.alt}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="inline-flex items-center rounded-full bg-deep-black/75 px-2 py-0.5 text-[10px] sm:text-label-xs font-semibold text-pure-white backdrop-blur-xs">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="flex flex-1 flex-col justify-between p-space-sm sm:p-space-md">
                        <div className="space-y-1 sm:space-y-1.5">
                          <h3 className="line-clamp-2 text-xs sm:text-label-lg font-semibold leading-snug text-on-surface transition-colors group-hover:text-primary">
                            {item.title}
                          </h3>
                          <p className="line-clamp-2 text-[11px] sm:text-body-sm leading-relaxed text-on-surface-variant">
                            {item.summary}
                          </p>
                        </div>
                        <div className="mt-space-sm flex items-center justify-between border-t border-border-hairline pt-space-xs text-[10px] sm:text-label-sm text-muted-gray">
                          <span className="inline-flex items-center gap-1">
                            <Clock aria-hidden className="size-3 sm:size-3.5" />
                            {item.readingMinutes} mnt baca
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold text-on-surface transition-colors group-hover:text-primary">
                            Baca
                            <ArrowRight
                              aria-hidden
                              className="size-3 sm:size-3.5 transition-transform group-hover:translate-x-0.5"
                            />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>

            <div className="mt-space-2xl text-center">
              <Link
                href="/knowledge"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border-hairline bg-surface-container-lowest px-8 text-label-lg font-semibold text-on-surface shadow-hairline transition-all hover:border-primary/50 hover:bg-surface-container active:translate-y-px"
              >
                <span>Panduan Lainnya</span>
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
