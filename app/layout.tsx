import type { Metadata } from "next";
import './globals.css';
import { Roboto, Open_Sans } from 'next/font/google';

const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'] });
const openSans = Open_Sans({ weight: ['400', '600'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: "OpenEvidence Toy Frontend",
  description: "Good luck!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} ${openSans.className}`}>{children}</body>
    </html>
  );
}
