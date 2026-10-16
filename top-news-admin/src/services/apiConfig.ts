export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://top-newsss-project.vercel.app';
  }
  return import.meta.env.VITE_API_BASE_URL || 'https://top-newsss-project.vercel.app';
};

export const API_BASE_URL = getApiBaseUrl();
