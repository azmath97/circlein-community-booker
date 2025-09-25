import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-8">
      <div className="container-max mx-auto px-4 py-6 text-sm text-gray-600 flex items-center justify-between">
        <div>© {new Date().getFullYear()} CircleIn</div>
        <div className="text-xs text-gray-500">Built for community amenity booking</div>
      </div>
    </footer>
  )
}
