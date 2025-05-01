import type { Metadata } from "next";
import "@repo/ui/globalStyles"

export const metadata: Metadata = {
  title: "Apptit",
  description: "Système intelligent de capture et traçabilité alimentaire",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="">
        {children}
      </body>
    </html>
  );
}
