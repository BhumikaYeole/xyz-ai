export interface Language {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string; // BCP-47 for Web Speech API
}

export const LANGUAGES: Language[] = [
  { code: 'en',  name: 'English',   nativeName: 'English',    speechCode: 'en-IN' },
  { code: 'hi',  name: 'Hindi',     nativeName: 'हिन्दी',     speechCode: 'hi-IN' },
  { code: 'ta',  name: 'Tamil',     nativeName: 'தமிழ்',      speechCode: 'ta-IN' },
  { code: 'te',  name: 'Telugu',    nativeName: 'తెలుగు',     speechCode: 'te-IN' },
  { code: 'mr',  name: 'Marathi',   nativeName: 'मराठी',      speechCode: 'mr-IN' },
  { code: 'bn',  name: 'Bengali',   nativeName: 'বাংলা',      speechCode: 'bn-IN' },
  { code: 'gu',  name: 'Gujarati',  nativeName: 'ગુજરાતી',    speechCode: 'gu-IN' },
  { code: 'pa',  name: 'Punjabi',   nativeName: 'ਪੰਜਾਬੀ',    speechCode: 'pa-IN' },
  { code: 'kn',  name: 'Kannada',   nativeName: 'ಕನ್ನಡ',      speechCode: 'kn-IN' },
  { code: 'ml',  name: 'Malayalam', nativeName: 'മലയാളം',     speechCode: 'ml-IN' },
  { code: 'ur',  name: 'Urdu',      nativeName: 'اردو',       speechCode: 'ur-IN' },
];

export const LANGUAGE_NAMES: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.name])
);

export function getSpeechCode(langCode: string): string {
  return LANGUAGES.find((l) => l.code === langCode)?.speechCode ?? 'en-IN';
}
