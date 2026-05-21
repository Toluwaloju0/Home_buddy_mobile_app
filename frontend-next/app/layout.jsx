import './globals.css';

export const metadata = {
  title: 'Home Buddy',
  description: 'Verified housing platform for buyers, sellers, and admins.',
  icons: {
    icon: '/home_buddy_icon.ico',
    shortcut: '/home_buddy_icon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/home_buddy_icon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
