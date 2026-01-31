// API Endpoints Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,

  // Contact
  CONTACT_SUBMIT: `${API_BASE_URL}/api/contact/submit`,

  // Newsletter
  NEWSLETTER_SUBSCRIBE: `${API_BASE_URL}/api/newsletter/subscribe`,

  // Events
  EVENTS: `${API_BASE_URL}/api/events`,
  EVENT_BY_ID: (id: string) => `${API_BASE_URL}/api/events?id=${id}`,

  // Team
  TEAM: `${API_BASE_URL}/api/team`,
  TEAM_MEMBER_BY_ID: (id: string) => `${API_BASE_URL}/api/team?id=${id}`,
};

// Application Settings
export const APP_CONFIG = {
  SITE_NAME: 'PPIA Queensland',
  SITE_DESCRIPTION: 'Perhimpunan Pelajar Indonesia di Australia, Queensland',
  DEFAULT_LANGUAGE: 'en' as const,
  SUPPORTED_LANGUAGES: ['en', 'id'] as const,
};

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME_MIN_LENGTH: 3,
  PASSWORD_MIN_LENGTH: 6,
  MESSAGE_MIN_LENGTH: 10,
};

// Colors (matching brand)
export const COLORS = {
  PRIMARY: '#B64847',
  SECONDARY: '#FEB602',
  DARK: '#303030',
  LIGHT: '#FFFAF5',
  ACCENT: '#886644',
  BORDER: '#E4DBCA',
};
