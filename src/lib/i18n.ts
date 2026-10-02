export type Language = 'EN' | 'HI';

/**
 * Chrome-level translations for the government banner, header and footer.
 * Workflow screens keep their English copy; untranslated keys fall back to
 * English rather than rendering a blank label.
 */
const DICTIONARY: Record<Language, Record<string, string>> = {
  EN: {},
  HI: {
    'banner.govt': 'भारत सरकार | जनजातीय कार्य मंत्रालय',
    'banner.font': 'अक्षर:',
    'banner.highContrast': 'उच्च कंट्रास्ट',
    'banner.standardMode': 'सामान्य मोड',
    'banner.switchToHindi': 'हिंदी',
    'banner.switchToEnglish': 'English',
    'nav.home': 'मुख्य पृष्ठ',
    'nav.schemes': 'योजनाएँ और अनुदान',
    'nav.eligibility': 'पात्रता जाँच',
    'nav.myApplications': 'मेरे आवेदन',
    'nav.scrutiny': 'जाँच कार्यक्षेत्र',
    'nav.screening': 'स्क्रीनिंग डेस्क',
    'nav.admin': 'प्रशासन नियंत्रण',
    'nav.help': 'सहायता और प्रश्न',
    'nav.dashboard': 'डैशबोर्ड',
    'brand.subtitle': 'राष्ट्रीय छात्रवृत्ति एवं फेलोशिप प्रबंधन प्रणाली',
    'header.notifications': 'सूचनाएँ',
    'header.noNotifications': 'इस समय कोई सूचना नहीं है।',
    'header.switchAccount': 'खाता बदलें',
    'header.signOut': 'साइन आउट',
    'header.demoSwitcher': 'डेमो स्विचर:',
    'header.demoHint': 'अनुमति की पूर्वावलोकन के लिए भूमिका चुनें:',
    'header.resetDemo': 'डेमो डेटा रीसेट करें',
    'footer.about': 'पोर्टल के बारे में',
    'footer.quickLinks': 'त्वरित लिंक',
    'footer.support': 'सहायता केंद्र',
    'footer.legal': 'कानूनी सूचना',
    'footer.privacy': 'गोपनीयता नीति',
    'footer.terms': 'नियम एवं शर्तें',
    'footer.accessibility': 'सुगम्यता वक्तव्य',
    'footer.audit': 'लेखा परीक्षण',
    'footer.rights': 'सर्वाधिकार सुरक्षित।'
  }
};

export const translate = (lang: Language, key: string): string => DICTIONARY[lang]?.[key] ?? DICTIONARY.EN[key] ?? key;
