'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6 text-red-500">
        <XCircle className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Payment Failed</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Something went wrong with your transaction. Please try again or contact support.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/cart" 
          className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          Return to Cart
        </Link>
      </div>
    </div>
  )
}
