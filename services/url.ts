import { Platform } from 'react-native';

// Dynamic API Base URL resolution for development
// - Android Emulator loopback: http://10.0.2.2:5000
// - iOS Simulator / Localhost: http://localhost:5000
// - Physical device testing: Change this to your computer's local WiFi IP (e.g. 'http://192.168.1.50:5000')
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

export const ENDPOINTS = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    ONBOARDING: '/api/auth/onboarding',
  },
  USER: {
    BLOCKED_APPS: '/api/user/blocked-apps',
    SETTINGS: '/api/user/settings',
  },
  PRAYERS: {
    LIST: '/api/prayers',
    TODAY: '/api/prayers/today',
    INTERCEPT: '/api/prayers/intercept',
  },
  ANALYTICS: {
    LOG: '/api/analytics/log',
    SUMMARY: '/api/analytics/summary',
  },
};
