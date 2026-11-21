import type { CSSProperties } from 'react';
import {
  LayoutGrid,
  Building2,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Search,
  Package,
  Barcode,
  X,
  Leaf,
} from '@apptit/ui/icons';
const icons = {
  grid: LayoutGrid,
  building: Building2,
  arrow: ArrowRight,
  logout: LogOut,
  shield: ShieldCheck,
  search: Search,
  package: Package,
  barcode: Barcode,
  close: X,
  leaf: Leaf,
};
export type IconName = keyof typeof icons;
/** Keep existing app semantic names while sharing the curated Lucide primitives. */
export default function Icon({
  name,
  className,
  style,
}: {
  name: IconName;
  className?: string;
  style?: CSSProperties;
}) {
  const Component = icons[name];
  return (
    <Component className={className} style={style} size={20} strokeWidth={1.6} aria-hidden="true" />
  );
}
