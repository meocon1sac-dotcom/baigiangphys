export const API_KEY_STORAGE_KEY = "physicraft_gemini_api_key";

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
  } catch (e) {
    console.warn("Could not read API key from localStorage", e);
    return "";
  }
}

export function setStoredApiKey(key: string): void {
  try {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
    // Dispatch custom event so components can re-render immediately
    window.dispatchEvent(new Event("physicraft_api_key_changed"));
  } catch (e) {
    console.warn("Could not save API key to localStorage", e);
  }
}

export function removeStoredApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    window.dispatchEvent(new Event("physicraft_api_key_changed"));
  } catch (e) {
    console.warn("Could not remove API key from localStorage", e);
  }
}

export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 6) + "••••••••" + key.slice(-4);
}
