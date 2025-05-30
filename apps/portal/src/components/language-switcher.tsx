"use client";

import { useLanguage } from "@/context/language-context";
import { locales } from "@/i18n/i18n";
import { GlobeHemisphereWest } from "@phosphor-icons/react/dist/ssr";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { useRef } from "react";

export default function LanguageSwitcher({
  variant = "default",
}: {
  variant?: "default" | "home";
}) {
  const { locale, setLocale } = useLanguage();
  const menu = useRef<Menu>(null);

  const languageNames = {
    vi: "Tiếng Việt",
    en: "English",
  };

  const handleLanguageChange = (lang: "vi" | "en") => {
    setLocale(lang);
    if (menu.current) {
      menu.current.hide({} as any);
    }
  };

  const languageMenuItems: MenuItem[] = locales.map((lang) => ({
    label: languageNames[lang],
    command: () => handleLanguageChange(lang),
    template: () => (
      <div
        onClick={() => handleLanguageChange(lang)}
        className={`py-2 px-4 cursor-pointer hover:bg-gray-100 text-primary-dark rounded-xl ${
          locale === lang ? "font-semibold" : "font-normal"
        }`}
      >
        {languageNames[lang]}
      </div>
    ),
  }));

  return (
    <div>
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-full ${
          variant === "home"
            ? "text-white border border-gray-300 hover:bg-white/10"
            : "text-gray-700 bg-gray-100 hover:bg-gray-200"
        } transition duration-200`}
        onClick={(e) => menu.current?.toggle(e)}
      >
        <GlobeHemisphereWest size={16} weight="fill" />
        <span className="text-sm font-medium">{languageNames[locale]}</span>
      </button>

      <Menu
        model={languageMenuItems}
        popup
        ref={menu}
        className="custom-menu"
        popupAlignment="right"
        pt={{
          root: {
            className:
              "!py-0 !rounded-xl !border !border-gray-300 !shadow !bg-white !text-primary-dark !w-40 !mt-1",
          },
          separator: { className: "!m-0" },
        }}
      />
    </div>
  );
}
