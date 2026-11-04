import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './global.css';
export const metadata: Metadata = { title: 'Apptit · Développement', description: 'Environnement de démonstration synthétique Apptit.' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>;
}
