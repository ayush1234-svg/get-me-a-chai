import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionWrapper from "@/components/SessionWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Get Me A Tea ☕ — Support Your Favourite Creators",
  description:
    "Get Me A Tea is a creator monetization platform where fans can buy a tea (make a small donation) to support their favourite creators. Creators get a personal page, Razorpay-powered payments, and a dashboard to track earnings and supporters.",
  icons: {
    icon: [{ url: "/tea.gif?v=2", type: "image/gif" }],
    shortcut: [{ url: "/tea.gif?v=2", type: "image/gif" }],
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/tea.gif?v=3" type="image/gif" />
        <link rel="shortcut icon" href="/tea.gif?v=3" type="image/gif" />
      </head>
      <body className="overflow-x-hidden bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px] text-white">
        <SessionWrapper> 
          <Navbar />
          <div className=" min-h-screen bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px] text-white">
            {children}
          </div>
          <Footer />
        </SessionWrapper>
      </body>
    </html>
  );
}
