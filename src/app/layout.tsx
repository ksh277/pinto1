import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets:["latin"], weight:["400","500","600","700"] });

export const metadata = { title: "PINTO" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={poppins.className + " bg-white text-gray-900"}>
        <div className="mx-auto max-w-[1200px] px-4">{children}</div>
      </body>
    </html>
  );
}
