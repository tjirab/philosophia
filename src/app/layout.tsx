import type { Metadata } from 'next';
import { EB_Garamond, Cinzel } from 'next/font/google';
import './globals.css';

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${ebGaramond.variable} ${cinzel.variable}`}>
      <body className="bg-[#0e0d0b] text-[#f4efe6] antialiased selection:bg-[#c59b27]/30 selection:text-[#fef08a] font-serif">
        {children}
      </body>
    </html>
  );
}
