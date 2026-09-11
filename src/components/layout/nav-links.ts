import { serviceAreas } from "@/data/service-areas";

export type SubNavLink = {
  href: string;
  label: string;
};

export type NavItem = {
  href: string;
  label: string;
  children?: readonly SubNavLink[];
};

export const areaNavLinks: SubNavLink[] = serviceAreas.map((area) => ({
  href: `/services/${area.slug}`,
  label: area.name,
}));

/** Primary navigation, shared by the header, the mobile menu and the footer. */
export const navLinks: readonly NavItem[] = [
  { href: "/", label: "Beranda" },
  { href: "/portfolio", label: "Portofolio" },
  {
    href: "/services",
    label: "Layanan Area",
    children: areaNavLinks,
  },
  { href: "/knowledge", label: "Panduan" },
  { href: "/about", label: "Tentang" },
  { href: "/contact", label: "Kontak" },
] as const;

export type NavLink = (typeof navLinks)[number];
