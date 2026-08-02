import './globals.css';
import TawkChat from '@/components/TawkChat';

export const metadata = {
  title: 'Home Buddy Connect Limited',
  description: 'Verified housing platform for buyers, sellers, and admins.',
  icons: {
    icon: '/home_buddy_icon.ico',
    shortcut: '/home_buddy_icon.ico',
  },
};

export default function RootLayout({ children }) {
  const tawkUri = process.env.TAWK_URI;

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/home_buddy_icon.ico" />
      </head>
      <body>
        {children}
        <TawkChat tawkUri={tawkUri} />
      </body>
    </html>
  );
}
