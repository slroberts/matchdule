import {
  getPlatform,
  mapWebUrl,
  mapAndroidIntent,
  mapIosDeepLink,
  mapAppleUrl,
} from "@/lib/maps";

export default function MapLink({
  address,
  lat,
  lng,
  children,
}: {
  address?: string;
  lat?: number;
  lng?: number;
  children?: React.ReactNode;
}) {
  const { isAndroid, isIOS } = getPlatform();
  const web = mapWebUrl({ address, lat, lng });

  const href = isAndroid
    ? mapAndroidIntent({ address, lat, lng })
    : isIOS
    ? mapIosDeepLink({ address, lat, lng }) ||
      mapAppleUrl({ address, lat, lng })
    : web;

  const onClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (!isIOS) return; // Android/desktop: let browser handle
    const deep = mapIosDeepLink({ address, lat, lng });
    if (!deep) return;
    e.preventDefault();
    const t = setTimeout(() => window.open(web, "_blank", "noopener"), 350);
    window.location.href = deep;
    setTimeout(() => clearTimeout(t), 1500);
  };

  return (
    <a href={href} onClick={onClick} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
