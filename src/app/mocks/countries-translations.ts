// Translation keys for countries using ISO codes
// To be used with translate pipe: {{ 'countries.' + country.iso | translate }}

export const COUNTRY_TRANSLATIONS = {
  // This file maps ISO codes to translation keys
  // Translations should be added to the language files as: "countries.AF": "Afghanistan"
};

// Helper function to get country translation key
export function getCountryTranslationKey(iso: string): string {
  return `countries.${iso}`;
}
