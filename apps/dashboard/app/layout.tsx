import type { Metadata } from "next";
import "@repo/ui/globalStyles";
import { Sora } from 'next/font/google';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Apptit",
  description: "Système intelligent de capture et traçabilité alimentaire",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={sora.variable}>
      <body className="">
        {children}
      </body>
    </html>
  );
}
