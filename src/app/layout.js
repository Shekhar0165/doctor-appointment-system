import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Doctor Appointment System",
  description: "Book appointments with doctors online",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-slate-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl font-bold">
                Doctor Appointment System
              </Link>
              <nav className="space-x-4">
                <Link href="/" className="hover:text-slate-300">
                  Home
                </Link>
                <Link href="/patient" className="hover:text-slate-300">
                  Book Appointment
                </Link>
                <Link href="/patient/my-appointments" className="hover:text-slate-300">
                  My Appointments
                </Link>
                <Link href="/patient/login" className="hover:text-slate-300">
                  Patient Login
                </Link>
                <Link href="/hospital" className="hover:text-slate-300">
                  Hospital Portal
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-grow container mx-auto p-4">
            {children}
          </main>
          <footer className="bg-slate-800 text-white p-4">
            <div className="container mx-auto text-center">
              <p>© {new Date().getFullYear()} Doctor Appointment System. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
