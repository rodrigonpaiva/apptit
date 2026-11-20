'use client';
import { useState } from 'react';
import Image from 'next/image';
import Icon from './workspace-icon';
import { fr } from '../../i18n/fr';
export default function ProductReferencePhoto({ url, source, sourceUrl }: { url: string | null; source?: 'catalogue' | 'open_food_facts'; sourceUrl?: string | null }) {
  const [failed, setFailed] = useState(false); const shown = Boolean(url) && !failed;
  return <figure className="lookup-photo">{shown ? <Image unoptimized src={url!} width={200} height={200} referrerPolicy="no-referrer" alt={fr.receiving.photoAlt} onError={() => setFailed(true)} /> : <div className="lookup-photo-empty"><Icon name="grid" /><span>{fr.receiving.photoMissing}</span></div>}
    {shown && <figcaption>{source === 'open_food_facts' ? <><a href={sourceUrl ?? undefined} target="_blank" rel="noopener noreferrer">{fr.receiving.offPhoto}</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a></> : fr.receiving.cataloguePhoto}</figcaption>}
  </figure>;
}
