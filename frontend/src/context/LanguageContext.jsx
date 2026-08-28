import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import ur from '../locales/ur.json';

const LanguageContext = createContext();

const translations = { en, ur };

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('selectedLanguage');
    return saved === 'ur' ? 'ur' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
    // Update HTML dir and lang attributes on the root html element
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'ur') {
      setLanguageState(lang);
    }
  };

  const t = (keyPath, replacements = {}) => {
    const keys = keyPath.split('.');
    let result = translations[language];
    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        // Fallback to English
        let fallback = translations['en'];
        for (const fKey of keys) {
          if (fallback && fallback[fKey] !== undefined) {
            fallback = fallback[fKey];
          } else {
            return keyPath;
          }
        }
        result = fallback;
        break;
      }
    }

    if (typeof result === 'string') {
      // Process replacements, e.g. {year} or {number}
      let finalString = result;
      Object.entries(replacements).forEach(([k, v]) => {
        finalString = finalString.replace(`{${k}}`, v);
      });
      return finalString;
    }

    return result;
  };

  const dir = language === 'ur' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
