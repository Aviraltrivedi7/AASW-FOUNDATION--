const fs = require('fs');
const path = require('path');

// Simple key-value translation dictionaries for SSR.
// In a full production app, this would be a JSON file per language.
const translations = {
    en: {
        "nav_home": "Home",
        "nav_about": "About Us",
        "nav_initiatives": "Initiatives",
        "nav_team": "Team",
        "nav_volunteer": "Volunteer",
        "nav_donate": "Donate Now",
        "join_us": "Join Us",
        "become_member": "Become a Member",
        // Fallback catch-all for any untranslated string to just return the key formatted loosely
    },
    hi: {
        "nav_home": "होम",
        "nav_about": "हमारे बारे में",
        "nav_initiatives": "पहल",
        "nav_team": "टीम",
        "nav_volunteer": "स्वयंसेवक",
        "nav_donate": "दान करें",
        "join_us": "हमसे जुड़ें",
        "become_member": "सदस्य बनें",
    }
};

function getTranslator(lang) {
    const defaultLang = 'en';
    const l = translations[lang] ? lang : defaultLang;
    
    return function t(key, defaultText) {
        if (translations[l][key]) {
            return translations[l][key];
        }
        // If translation is missing but default text is provided, show default text
        if (defaultText) return defaultText;
        
        // Return raw key if really missing
        return key;
    };
}

module.exports = { getTranslator };
