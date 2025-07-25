"use client";

import { defaultLocale, Locale, messages } from "@/i18n/i18n";
import React, { createContext, useContext, useEffect, useState } from "react";

type Dictionary = Record<string, any>;

type LanguageContextType = {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [dictionary, setDictionary] = useState<Dictionary>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if there's a stored language preference
    const savedLocale = localStorage.getItem("language") as Locale | null;
    const initialLocale = savedLocale || defaultLocale;

    // Load dictionary
    messages[initialLocale]()
      .then((dict) => {
        setDictionary(dict);
        setLocaleState(initialLocale);
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error("Failed to load dictionary:", error);
        // Fall back to default locale if there's an error
        if (initialLocale !== defaultLocale) {
          messages[defaultLocale]().then((dict) => {
            setDictionary(dict);
            setLocaleState(defaultLocale);
            setIsLoaded(true);
          });
        } else {
          setIsLoaded(true);
        }
      });
  }, []);

  // Function to change the locale
  const setLocale = (newLocale: Locale) => {
    localStorage.setItem("language", newLocale);
    messages[newLocale]().then((dict) => {
      setDictionary(dict);
      setLocaleState(newLocale);
    });
  };

  // Translation function
  const t = (key: string): string => {
    // Split the key by dots to traverse the dictionary
    const keys = key.split(".");
    let value: any = dictionary;

    // Traverse through the dictionary
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return the key itself as fallback
      }
    }

    return typeof value === "string" ? value : key;
  };

  // Don't render children until dictionary is loaded
  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ locale, dictionary, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
