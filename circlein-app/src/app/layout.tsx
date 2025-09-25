import './globals.css'
import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export const metadata = {
  title: 'CircleIn - Community Booker',
  description: 'Book amenities and manage your community'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 container-max px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
