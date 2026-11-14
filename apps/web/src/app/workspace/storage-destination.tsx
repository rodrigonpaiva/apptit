'use client';
import { useId } from 'react';
import { storageCategories } from '@apptit/contracts';
import type { ReceiptLocation } from '@apptit/contracts';
import { fr } from '../../i18n/fr';
export default function StorageDestination({ failed, ready, value, locations, change, canManage, recordedName, legacy }: { failed: boolean; ready: boolean; value: string; locations: ReceiptLocation[]; change: (id: string) => void; canManage: boolean; recordedName?: string; legacy?: string }) {
  const controlId = useId();
  const selected = locations.find(location => location.id === value), unavailable = value && !selected;
  return <div className="storage-destination"><label htmlFor={controlId}>{fr.receiving.destination}</label><select id={controlId} disabled={!ready} value={value} onChange={event => change(event.target.value)}><option value="">{fr.receiving.pending}</option>{unavailable && <option value={value} disabled>{recordedName ?? value} — {fr.receiving.legacy}</option>}
    {storageCategories.map(category => { const group = locations.filter(location => location.category === category); return group.length ? <optgroup key={category} label={fr.categories[category].label}>{group.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}</optgroup> : null; })}
  </select>{!ready && <p role="status" className="lookup-small">{failed ? fr.receiving.locationsUnavailable : fr.storage.loading}</p>}{ready && locations.length === 0 && <p role="status" className="lookup-small">{fr.receiving.emptyLocations} {canManage && <a href="#storage">{fr.receiving.configure}</a>}</p>}{legacy && <p className="lookup-small">{fr.receiving.legacyOriginal} : {legacy}</p>}
  <details open className="storage-references"><summary>{fr.receiving.referenceTitle}</summary><p className="lookup-small">{fr.receiving.referenceDisclaimer}</p><ul>{storageCategories.map(category => <li key={category} className={selected?.category === category ? 'storage-selected' : undefined}><strong>{fr.categories[category].label}</strong><p>{fr.categories[category].reference}</p></li>)}</ul></details></div>;
}
