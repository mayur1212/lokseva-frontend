import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "LokSeva AI",
  description: "उत्पन्नाचा दाखला व्यवस्थापन प्रणाली",
  icons: { icon: "/lokseva.svg" },
  other: { google: "notranslate" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="mr" translate="no"><body>
    <AuthProvider>{children}</AuthProvider>
    <Toaster position="bottom-right" />
  </body></html>;
}
