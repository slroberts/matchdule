export type MapTarget = { address?: string; lat?: number; lng?: number };

const q = (s: string) => encodeURIComponent(s);

export function mapWebUrl({ address, lat, lng }: MapTarget) {
  if (lat != null && lng != null)
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  if (address)
    return `https://www.google.com/maps/search/?api=1&query=${q(address)}`;
  return "https://www.google.com/maps";
}

export function mapAppleUrl({ address, lat, lng }: MapTarget) {
  if (lat != null && lng != null)
    return `https://maps.apple.com/?ll=${lat},${lng}`;
  if (address) return `https://maps.apple.com/?q=${q(address)}`;
  return "https://maps.apple.com";
}

export function mapIosDeepLink({ address, lat, lng }: MapTarget) {
  if (lat != null && lng != null) return `comgooglemaps://?q=${lat},${lng}`;
  if (address) return `comgooglemaps://?q=${q(address)}`;
  return undefined;
}

export function mapAndroidIntent({ address, lat, lng }: MapTarget) {
  const query = lat != null && lng != null ? `${lat},${lng}` : q(address || "");
  // Chrome Android “intent://” avoids the scheme error and falls back cleanly
  return `intent://maps.google.com/?q=${query}#Intent;package=com.google.android.apps.maps;scheme=https;end`;
}

export function getPlatform() {
  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  return { isAndroid, isIOS };
}
