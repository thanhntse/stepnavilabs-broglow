export const defaultLocale = "vi";
export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

export const messages = {
  en: () => import("./messages/en.json").then((module) => module.default),
  vi: () => import("./messages/vi.json").then((module) => module.default),
};
