import type { Metadata } from 'next';
import { EB_Garamond, Cinzel } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../lib/theme-context';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Philosophy Graph | The Evolution of Ideas & Philosophers',
  description:
    'An interactive network and lineage explorer showing how philosophical ideas evolved from Pre-Socratics to Contemporary thought, integrated with Philosophize This! podcasts and the Stanford Encyclopedia of Philosophy.',
  referrer: 'strict-origin-when-cross-origin',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${cinzel.variable} dark`}>
      <body className="antialiased font-serif">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
