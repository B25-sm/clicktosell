import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ClicktoSell - Buy & Sell Anything',
  description: 'Buy and sell anything locally with ClicktoSell. Find great deals on electronics, furniture, vehicles, and more.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
  keywords: ['classifieds', 'buy', 'sell', 'local', 'marketplace', 'electronics', 'furniture', 'vehicles'],
  authors: [{ name: 'ClicktoSell' }],
  openGraph: {
    title: 'ClicktoSell - Buy & Sell Anything',
    description: 'Find great deals on electronics, furniture, vehicles, and more.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClicktoSell - Buy & Sell Anything',
    description: 'Find great deals on electronics, furniture, vehicles, and more.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0F2C',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}