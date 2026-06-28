import type { Metadata } from "next";
import { Open_Sans, Public_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "KÓ WON — Premium Student Talents & Crafts",
    template: "%s | KÓ WON",
  },
  description: "Connecting skilled Nigerian student freelancers and creators with clients seeking affordable, high-end crafts and services. Secure escrow system.",
  keywords: [
    "Kowon",
    "Nigerian freelancers",
    "student side hustle",
    "campus crafts",
    "bespoke tailoring Nigeria",
    "affordable web designers Lagos",
    "escrow payments Nigeria",
    "student talents",
  ],
  authors: [{ name: "KÓ WON" }],
  creator: "KÓ WON",
  metadataBase: new URL("https://kowon.com.ng"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://kowon.com.ng",
    title: "KÓ WON — Premium Student Talents & Crafts",
    description: "Discover skilled student freelancers and physical artisans on Nigerian campuses. Secure escrow checkouts.",
    siteName: "KÓ WON",
  },
  twitter: {
    card: "summary_large_image",
    title: "KÓ WON — Premium Student Talents & Crafts",
    description: "Discover skilled student freelancers and physical artisans on Nigerian campuses. Secure escrow checkouts.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${publicSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
