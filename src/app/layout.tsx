import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
