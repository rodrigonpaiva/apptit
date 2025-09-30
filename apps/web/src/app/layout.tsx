import './global.css';

import type { ReactNode } from 'react';

import Providers from '@/app/providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
