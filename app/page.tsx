'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/hr-agent')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Pharmacy HR Agent</h1>
        <p className="text-foreground/60">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}
