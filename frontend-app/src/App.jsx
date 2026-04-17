import { UserProvider } from "@/app/context/UserContext";
import Header from "@/components/Header";
import { routes, RouteNotFound } from "./routes";
import { usePathname } from "next/navigation";

const hiddenHeaderRoutes = new Set([
  "/join",
  "/role",
  "/verify-otp",
  "/dashboard",
  "/agents&landlords/allagents",
]);

export default function App() {
  const pathname = usePathname();
  const normalizedPathname = pathname !== "/" ? pathname.replace(/\/+$/, "") || "/" : "/";
  const Page = routes[normalizedPathname] || RouteNotFound;
  const hideHeader = hiddenHeaderRoutes.has(normalizedPathname);

  return (
    <UserProvider>
      {!hideHeader && <Header />}
      <Page />
    </UserProvider>
  );
}