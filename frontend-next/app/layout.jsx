import './globals.css';

export const metadata = {
  title: 'Home Buddy',
  description: 'Verified housing platform for buyers, sellers, and admins.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
