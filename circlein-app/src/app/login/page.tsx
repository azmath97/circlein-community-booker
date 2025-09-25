'use client'
import React, { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: wire this to your auth logic (NextAuth/firebase)
    console.log('submit login', { email, password })
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Log in</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
          </div>

          <button type="submit" className="btn btn-primary w-full py-2 rounded-md">Log in</button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account? <Link href="/signup" className="text-indigo-600">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
