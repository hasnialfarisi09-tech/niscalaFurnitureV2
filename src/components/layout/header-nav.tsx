"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { duration, easeOutEditorial } from "@/components/motion/tokens";
import { navLinks } from "@/components/layout/nav-links";
import { isActivePath } from "@/components/layout/is-active";

/** One bar, shared by every link, so it travels between them. */
const ACTIVE_MARKER = "header-nav-active";

type HeaderNavProps = {
  /** Set while the bar floats over the hero photograph, on a dark ground. */
  inverse?: boolean;
};

/** Desktop navigation. Client-side only because it highlights the active route. */
export function HeaderNav({ inverse = false }: HeaderNavProps) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpenDropdown(null);
  }
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLLIElement | null>(null);

  // Handle clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMouseEnter = (label: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  return (
    <nav aria-label="Navigasi utama" className="hidden lg:block">
      <ul className="flex items-center gap-space-sm">
        {navLinks.map((link) => {
          const hasChildren = Boolean(link.children && link.children.length > 0);
          const active = isActivePath(pathname, link.href);
          const isOpen = openDropdown === link.label;

          if (hasChildren && link.children) {
            return (
              <li
                key={link.href}
                className="relative"
                ref={isOpen ? dropdownRef : null}
                onMouseEnter={() => handleMouseEnter(link.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setOpenDropdown(isOpen ? null : link.label)}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  className={cn(
                    "group relative inline-flex min-h-10 items-center gap-1.5 rounded-md px-space-sm text-label-lg [letter-spacing:0] transition-[color,background-color,translate] duration-200 active:translate-y-px",
                    inverse
                      ? active
                        ? "text-inverse-on-surface"
                        : "text-inverse-on-surface/70 hover:bg-pure-white/10 hover:text-inverse-on-surface"
                      : active
                        ? "text-on-surface"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  )}
                >
                  {active ? (
                    prefersReduced ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-space-sm bottom-1 h-0.5 rounded-full bg-primary-container"
                      />
                    ) : (
                      <motion.span
                        aria-hidden
                        layoutId={ACTIVE_MARKER}
                        className="absolute inset-x-space-sm bottom-1 h-0.5 rounded-full bg-primary-container"
                        transition={{
                          duration: duration.standard,
                          ease: easeOutEditorial,
                        }}
                      />
                    )
                  ) : (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-space-sm bottom-1 h-0.5 rounded-full bg-transparent transition-colors duration-200",
                        inverse
                          ? "group-hover:bg-inverse-on-surface/18"
                          : "group-hover:bg-border-hairline-strong"
                      )}
                    />
                  )}
                  <span>{link.label}</span>
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      "size-3.5 transition-transform duration-200 opacity-70 group-hover:opacity-100",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div
                    className={cn(
                      "absolute left-0 top-full z-50 mt-1.5 w-72 origin-top-left rounded-lg border p-1.5 shadow-panel backdrop-blur-xl focus:outline-none",
                      inverse
                        ? "border-border-hairline-dark bg-deep-black/95 text-inverse-on-surface"
                        : "border-border-hairline bg-surface/98 text-on-surface"
                    )}
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-gray">
                      {link.label === "Furniture Custom" ? "Kategori Custom" : "Wilayah Jangkauan"}
                    </div>
                    <ul className="space-y-0.5 max-h-[70vh] overflow-y-auto pr-0.5">
                      <li role="none">
                        <Link
                          href={link.href}
                          role="menuitem"
                          className={cn(
                            "flex items-center justify-between rounded-md px-2.5 py-2 text-label-md transition-colors duration-150 border-b border-border-hairline/60 mb-1 font-semibold",
                            pathname === link.href
                              ? inverse
                                ? "bg-pure-white/15 text-inverse-on-surface"
                                : "bg-surface-container-low text-primary"
                              : inverse
                                ? "text-inverse-on-surface/90 hover:bg-pure-white/10 hover:text-inverse-on-surface"
                                : "text-on-surface hover:bg-surface-container-low hover:text-primary"
                          )}
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span>Semua {link.label}</span>
                          <span aria-hidden className="text-xs">→</span>
                        </Link>
                      </li>
                      {link.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <li key={child.href} role="none">
                            <Link
                              href={child.href}
                              role="menuitem"
                              className={cn(
                                "flex items-center justify-between rounded-md px-2.5 py-2 text-label-md transition-colors duration-150",
                                childActive
                                  ? inverse
                                    ? "bg-pure-white/15 font-semibold text-inverse-on-surface"
                                    : "bg-surface-container-low font-semibold text-primary"
                                  : inverse
                                    ? "text-inverse-on-surface/80 hover:bg-pure-white/10 hover:text-inverse-on-surface"
                                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                              )}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <span>{child.label}</span>
                              {childActive ? (
                                <span
                                  aria-hidden
                                  className="size-1.5 rounded-full bg-primary-container"
                                />
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          }

          // Regular navigation item
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative inline-flex min-h-10 items-center rounded-md px-space-sm text-label-lg [letter-spacing:0] transition-[color,background-color,translate] duration-200 active:translate-y-px",
                  inverse
                    ? active
                      ? "text-inverse-on-surface"
                      : "text-inverse-on-surface/70 hover:bg-pure-white/10 hover:text-inverse-on-surface"
                    : active
                      ? "text-on-surface"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                )}
              >
                {active ? (
                  prefersReduced ? (
                    <span
                      aria-hidden
                      className="absolute inset-x-space-sm bottom-1 h-0.5 rounded-full bg-primary-container"
                    />
                  ) : (
                    <motion.span
                      aria-hidden
                      layoutId={ACTIVE_MARKER}
                      className="absolute inset-x-space-sm bottom-1 h-0.5 rounded-full bg-primary-container"
                      transition={{
                        duration: duration.standard,
                        ease: easeOutEditorial,
                      }}
                    />
                  )
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-space-sm bottom-1 h-0.5 rounded-full bg-transparent transition-colors duration-200",
                      inverse
                        ? "group-hover:bg-inverse-on-surface/18"
                        : "group-hover:bg-border-hairline-strong"
                    )}
                  />
                )}
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
