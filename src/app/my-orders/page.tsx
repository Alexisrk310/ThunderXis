'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/components/LanguageProvider'
import Link from 'next/link'

interface Order {
  id: string
  created_at: string
  status: string
  total: number
  shipping_address: string
  city: string
  items?: any[] // In a real app, you'd join with order_items
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders for user:', user?.id)
      if (!user?.id) {
         console.warn('User ID is undefined, skipping fetch')
         return 
      }

      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, status, total, shipping_address, city')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setOrders(data)
    } catch (error: any) {
      console.error('Error fetching orders:', JSON.stringify(error, null, 2))
      // alert('Error fetching orders: ' + (error.message || 'Unknown error')) 
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'shipped': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'paid': return <CheckCircle className="w-4 h-4" />
        case 'pending': return <Clock className="w-4 h-4" />
        case 'shipped': return <Truck className="w-4 h-4" />
        case 'cancelled': return <XCircle className="w-4 h-4" />
        default: return <Package className="w-4 h-4" />
    }
  }

  if (loading) {
      return (
          <div className="min-h-screen pt-24 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
                <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold">{t('my_orders.title')}</h1>
                <p className="text-muted-foreground">{t('my_orders.desc')}</p>
            </div>
        </div>

        <div className="space-y-4">
             {orders.length === 0 ? (
                 <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
                     <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                     <h3 className="text-lg font-medium mb-2">{t('my_orders.no_orders')}</h3>
                     <p className="text-muted-foreground mb-6">{t('my_orders.no_orders_desc')}</p>
                     <Link href="/shop" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                        {t('my_orders.start_shopping')}
                     </Link>
                 </div>
             ) : (
                 orders.map((order, i) => (
                     <motion.div 
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-card border border-border/50 rounded-xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                     >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        <span className="capitalize">{order.status}</span>
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{order.city}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 flex-1">
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t('my_orders.total')}</p>
                                    <p className="font-bold text-lg">
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(Number(order.total))}
                                    </p>
                                </div>
                                <button className="p-2 rounded-full hover:bg-white/5 transition-colors group-hover:translate-x-1 duration-300">
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                     </motion.div>
                 ))
             )}
        </div>
      </div>
    </div>
  )
}
