
"use client"
import { Inter } from 'next/font/google'
import "./globals.css";
import Header from "@/components/Header";
import { usePathname } from 'next/navigation';
import { UserProvider } from "@/app/context/UserContext";

const inter = Inter({
  subsets: ['latin'],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
})

/* export default function RootLayout({ children }) {
  const pathname = usePathname();

  const hideHeader = pathname === "/join" || pathname === "/join/role";
  

  return (
    <html lang="en">
      <body>
        {!hideHeader && <Header />}

        {children}
      </body>
    </html>
  );
} */

  export default function RootLayout({ children }) {

    const pathname = usePathname();

  const hideHeader = pathname === "/join" || pathname === "/role" || pathname === "/verify-otp";

  return (
    <html lang="en">
      <body>
        
        <UserProvider>
          {!hideHeader && <Header />}
          {/* Your layout structure */}
          {children}
        </UserProvider>
      </body>
    </html>
  );
}