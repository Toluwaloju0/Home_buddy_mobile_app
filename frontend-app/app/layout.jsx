
"use client"
import { Inter } from 'next/font/google'
import "./globals.css";
import Header from "@/components/Header";
/* import Page from "./dashboard/page"; */
import DashboardNav from '@/components/DashboardNav';
import { usePathname } from 'next/navigation';
import { UserProvider } from "@/app/context/UserContext";

const inter = Inter({
  subsets: ['latin'],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
})


  export default function RootLayout({ children }) {

    const pathname = usePathname();

  const hideHeader = pathname === "/join" || pathname === "/role" || pathname === "/verify-otp" || pathname === "/dashboard" || pathname === "/agents&landlords/allagents";
  const dashboard = pathname === "/dashboard"
  return (
    <html lang="en">
      <body>
        
        <UserProvider>
          {!hideHeader && <Header />}
          {/* {dashboard && <DashboardNav />} */}
          {/* Your layout structure */}
          {children}
        </UserProvider>
      </body>
    </html>
  );
}