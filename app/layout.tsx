import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MVT - Veteran Mentorship Platform',
  description: 'Connecting military veterans for peer-to-peer mentorship',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}