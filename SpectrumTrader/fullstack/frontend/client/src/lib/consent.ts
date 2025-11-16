import Cookies from "js-cookie";

const DISCLAIMER_KEY = "tradyxa-disclaimer-accepted";
const CONSENT_KEY = "tradyxa-consent";

export type ConsentPreferences = {
  analytics: boolean;
  advertising: boolean;
};

export const getDisclaimerAccepted = (): { accepted: boolean; timestamp?: number } => {
  const value = localStorage.getItem(DISCLAIMER_KEY);
  if (!value) return { accepted: false };
  
  const timestamp = parseInt(value, 10);
  const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
  
  if (timestamp < twoDaysAgo) {
    localStorage.removeItem(DISCLAIMER_KEY);
    return { accepted: false };
  }
  
  return { accepted: true, timestamp };
};

export const setDisclaimerAccepted = (): void => {
  localStorage.setItem(DISCLAIMER_KEY, Date.now().toString());
};

export const getConsentPreferences = (): ConsentPreferences | null => {
  const value = Cookies.get(CONSENT_KEY);
  if (!value) return null;
  
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const setConsentPreferences = (preferences: ConsentPreferences): void => {
  Cookies.set(CONSENT_KEY, JSON.stringify(preferences), { expires: 365 });
};

export const hasShownConsentDialog = (): boolean => {
  return Cookies.get(CONSENT_KEY) !== undefined;
};
