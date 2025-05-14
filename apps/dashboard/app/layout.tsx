import type { Metadata } from "next";
import "@repo/ui/globalStyles";
import { Sora } from 'next/font/google';
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Apptit",
  description: "Système intelligent de capture et traçabilité alimentaire",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={sora.variable}>
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
