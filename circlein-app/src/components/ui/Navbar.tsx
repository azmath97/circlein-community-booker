'use client'
import Link from 'next/link'
import React from 'react'

export default function Navbar() {
  return (
    <header className="bg-white border-b">
      <div className="container-max mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-indigo-600 to-emerald-400 font-bold">
            C
          </div>
          <span className="text-lg font-semibold text-gray-800">CircleIn</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/bookings" className="text-sm font-medium text-gray-600 hover:text-gray-900">Bookings</Link>
          <Link href="/facilities" className="text-sm font-medium text-gray-600 hover:text-gray-900">Facilities</Link>
          <Link href="/signup" className="btn btn-primary px-4 py-2 rounded-md text-sm">Sign up</Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Log in</Link>
        </nav>
      </div>
    </header>
  )
}
