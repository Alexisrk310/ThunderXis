'use client'

import Link from 'next/link'
import { Check, ArrowRight, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/useCartStore'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useLanguage } from '@/components/LanguageProvider'

export default function SuccessPage() {
  const { t, language } = useLanguage()
  const clearCart = useCartStore((state) => state.clearCart)

  const [order, setOrder] = useState<any>(null)
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
  }

  useEffect(() => {
    // Only send email if we have items (before clearing)
    
    const fetchOrderAndSendEmail = async () => {
      try {
         // Fetch last order
         const { data: { user } } = await import('@/lib/supabase/client').then(m => m.supabase.auth.getUser())
         if (!user) return

         const { data: orders } = await import('@/lib/supabase/client').then(m => m.supabase
            .from('orders')
            .select('*, order_items(*, products(name, image_url, images))')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
         )

         if (orders && orders[0]) {
             setOrder(orders[0])
             
             // Confirm Order & Deduct Stock
             // We do this here for the user waiting on success page
             // BUT we don't send email here explicitly anymore, the webhook does it.
             // However, for dev without webhook support, or just to ensure status is updated immediately on UI:
             await fetch('/api/orders/confirm', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ orderId: orders[0].id })
             });

             // The webhook now handles the email sending to ensure reliability even if user closes this tab.
             // We just show the success state here.
         }
      } catch (e) {
          console.error(e)
      }
    }

    fetchOrderAndSendEmail()
    
    clearCart()
    // Trigger confetti
    const duration = 3 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#16a34a', '#4ade80']
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#16a34a', '#4ade80']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [clearCart, language, t]) // Added language and t to deps

  return (
    <div className="min-h-[85vh] bg-background flex flex-col items-center justify-start pt-16 pb-12 px-4 sm:px-6 relative overflow-visible">
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
          <Check className="w-10 h-10 text-white stroke-[3]" />
        </div>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-2xl w-full mx-auto space-y-8 text-center"
      >
        <div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-3">
            {t('page.success.title')}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
            {t('page.success.desc')}
            </p>
        </div>

        {order && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm text-left"
            >
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-border/50">
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{t('invoice.order_num')}</p>
                        <p className="font-mono font-bold text-lg">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            {t('dash.paid')}
                        </span>
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-4 mb-6">
                    {order.order_items?.map((item: any, idx: number) => {
                         const img = item.products?.image_url || item.products?.images?.[0]
                         return (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-muted rounded-xl relative overflow-hidden flex-shrink-0 border border-border/50">
                                    {img ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={img} alt={item.products?.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground font-bold">{t('dash.image_abbr')}</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-foreground text-sm truncate">{item.products?.name || t('dash.product')}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('dash.size')}: {item.size || 'N/A'} • {t('dash.table_qty')}: {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-foreground text-sm">{formatCurrency(item.price_at_time * item.quantity)}</p>
                                </div>
                            </div>
                         )
                    })}
                </div>

                <div className="h-px bg-border/50 my-6"></div>

                {/* Shipping & Totals */}
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-muted-foreground">{t('checkout.shipping')}</span>
                        <div className="text-right">
                             <p className="font-medium text-foreground">{order.city}, {order.shipping_address}</p>
                             <p className="text-xs text-green-600 font-bold">{t('dash.included')}</p>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-border/50">
                        <span className="font-black text-lg">{t('checkout.total')}</span>
                        <span className="font-black text-2xl text-primary">{formatCurrency(order.total)}</span>
                    </div>
                </div>
            </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-primary/25"
          >
            {t('page.success.view_order')} <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link 
            href="/shop" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border bg-card hover:bg-muted font-semibold transition-colors"
          >
            {t('page.success.continue_shopping')} <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
