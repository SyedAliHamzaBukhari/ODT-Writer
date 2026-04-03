'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        return
      }

      // Redirect to login page
      router.push('/login?registered=true')
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#191919]">
      <div className="w-full max-w-md p-8">
        <h1 className="text-4xl font-bold text-center text-[#e2e2e2] mb-2">
          ODT Writer
        </h1>
        <p className="text-center text-[#9aa6b2] mb-8">
          Create your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#e2e2e2] mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[#e2e2e2] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#ffffff] focus:border-transparent transition-all"
              placeholder="johndoe"
              required
              minLength={3}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#e2e2e2] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[#e2e2e2] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#ffffff] focus:border-transparent transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#e2e2e2] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[#e2e2e2] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#ffffff] focus:border-transparent transition-all"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#e2e2e2] mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[#e2e2e2] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#ffffff] focus:border-transparent transition-all"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#ffffff] text-[#191919] font-semibold rounded-lg hover:bg-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#ffffff] focus:ring-offset-2 focus:ring-offset-[#191919] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-8 text-center text-[#9aa6b2]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#ffffff] hover:text-[#e5e5e5] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
