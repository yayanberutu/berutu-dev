import React, { useState } from 'react';
import { navigation } from '../../data/site';
import { detectLocaleFromPath, getLanguageSwitchPath, localizePath, type Locale } from '../../i18n';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const currentLocale = detectLocaleFromPath(pathname);
  const activeLocale: Locale = currentLocale || "en";
  const switchToLocale: Locale = activeLocale === "en" ? "id" : "en";
  const switchPath = getLanguageSwitchPath(pathname, switchToLocale);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:text-foreground focus:outline-none"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border z-50 p-4 flex flex-col space-y-4 animate-in fade-in slide-in-from-top-4">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={localizePath(item.href, activeLocale)}
              className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {activeLocale === "id"
                ? item.name === "Home"
                  ? "Beranda"
                  : item.name === "Work"
                    ? "Proyek"
                    : item.name === "Services"
                      ? "Layanan"
                      : item.name === "About"
                        ? "Tentang"
                        : item.name === "Contact"
                          ? "Kontak"
                          : item.name
                : item.name}
            </a>
          ))}
          <a
            href={switchPath}
            className="w-full text-center px-4 py-2 border border-border rounded-lg font-semibold hover:bg-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {activeLocale === "en" ? "ID" : "EN"}
          </a>
          <a
            href={localizePath("/contact", activeLocale)}
            className="w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
            onClick={() => setIsOpen(false)}
          >
            {activeLocale === "id" ? "Hubungi Saya" : "Hire Me"}
          </a>
        </div>
      )}
    </div>
  );
}
