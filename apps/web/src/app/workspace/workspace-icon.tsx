import type { CSSProperties, ReactNode } from 'react';
type IconName = 'grid' | 'building' | 'arrow' | 'logout' | 'shield' | 'search' | 'package' | 'barcode' | 'close' | 'leaf';
const paths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  building: <><path d="M4 21V5l8-3 8 3v16M2 21h20M9 21v-5h6v5M8 7h1m6 0h1M8 11h1m6 0h1" /></>,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  logout: <><path d="M9 4H5v16h4m5-12 4 4-4 4m-5-4h13" /></>,
  shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  package: <><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v10l9 5 9-5V8M12 13v10M7.5 5.5l9 5" /></>,
  barcode: <path d="M3 5v14M7 5v14M10 5v14M14 5v14M17 5v14M21 5v14" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  leaf: <><path d="M19 4C7 3 2 9 6 15s15 2 13-11Z" /><path d="M4 21c0-7 6-9 10-12" /></>,
};
export default function Icon({ name, className, style }: { name: IconName; className?: string; style?: CSSProperties }) {
  return <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
