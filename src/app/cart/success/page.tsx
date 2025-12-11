'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useCartStore } from '@/store/useCartStore'

export default function SuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6 text-green-500 animate-bounce">
        <CheckCircle className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Thank you for your purchase. We&apos;ve received your order and will begin processing it immediately.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/" 
          className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link 
          href="/dashboard" // Assuming customer checks order history here or just back home
          className="border border-border px-8 py-3 rounded-xl font-medium hover:bg-muted/10 transition-colors"
        >
          View Order
        </Link>
      </div>
    </div>
  )
}
