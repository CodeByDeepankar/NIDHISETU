import Constants from 'expo-constants';

const FALLBACK_BASE_URL = 'http://10.21.99.70:3000';

type ExtraEnv = {
  API_BASE_URL?: string;
};

const extraEnv = (Constants.expoConfig?.extra ?? {}) as ExtraEnv;

const sanitize = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return undefined;
  }
  return trimmed.replace(/\/$/, '');
};

const resolvedBaseUrl =
  sanitize(process.env.EXPO_PUBLIC_API_BASE_URL) ??
  sanitize(extraEnv.API_BASE_URL) ??
  FALLBACK_BASE_URL;

export const getApiBaseUrl = () => resolvedBaseUrl;

export const buildApiUrl = (path: string) => {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};
