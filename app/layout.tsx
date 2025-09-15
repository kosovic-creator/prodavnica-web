import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";
import Navigation from "../components/Navigation";
// import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" href="/app/images/IMG_3688.jpg" />
        <link rel="icon" href="/app/images/IMG_3688.jpg" />
      </head>
      <body>
        <Providers>
          <Navigation />
          <div>{children}</div>
            {/* <Footer /> */}
        </Providers>
      </body>
    </html>
  );
}
