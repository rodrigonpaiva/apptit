'use client';
import { Button } from '@apptit/ui/components/button';
import Icon from './workspace-icon';

export type WorkspaceView = 'catalogue' | 'identify' | 'receiving' | 'storage';
const entries = [
  { view: 'catalogue', label: 'Catalogue produits', icon: 'grid' },
  { view: 'identify', label: 'Identifier un produit', icon: 'barcode' },
  { view: 'receiving', label: 'Réception', icon: 'package' },
  { view: 'storage', label: 'Lieux de stockage', icon: 'building' },
] as const;

/** App navigation owns capability visibility; server authorization remains authoritative. */
export default function WorkspaceNavigation({
  view,
  canReceive,
  canManageStorage,
}: {
  view: WorkspaceView;
  canReceive: boolean;
  canManageStorage: boolean;
}) {
  return (
    <nav className="workspace-nav" aria-label="Navigation du restaurant">
      <span className="sidebar-overline">Mon restaurant</span>
      {entries
        .filter((entry) => entry.view !== 'receiving' || canReceive)
        .filter((entry) => entry.view !== 'storage' || canManageStorage)
        .map((entry) => (
          <Button
            key={entry.view}
            asChild
            variant="ghost"
            className={`justify-start text-left text-white hover:bg-white/15 hover:text-white focus-visible:ring-ring-inverse border ${view === entry.view ? 'border-white/50 bg-white/15' : 'border-white/20 bg-white/5'}`}
          >
            <a href={`#${entry.view}`} aria-current={view === entry.view ? 'page' : undefined}>
              <Icon name={entry.icon} />
              <span>{entry.label}</span>
            </a>
          </Button>
        ))}
    </nav>
  );
}
