'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/components/LanguageProvider'
import { Search, Truck, CheckCircle, Clock, AlertCircle, Loader2, Package } from 'lucide-react'
import { OrderCardSkeleton } from '@/components/dashboard/skeletons'

interface Order {
  id: string
  created_at: string
  customer_name: string
  shipping_address: string
  city: string
  phone: string
  total: number
  status: string
  user_id: string
}

export default function DashboardOrders() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (!error) {
        await fetchOrders()
      } else {
        alert(t('dash.error_update_order'))
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const normalizeStatus = (s: string) => s.toLowerCase()
  
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || normalizeStatus(order.status) === filter
    const matchesSearch = !searchQuery || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch(normalizeStatus(status)) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'paid': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'delivered': return 'bg-green-100 text-green-700 border-green-300'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(normalizeStatus(status)) {
      case 'pending': return Clock
      case 'paid': return Package
      case 'shipped': return Truck
      case 'delivered': return CheckCircle
      case 'cancelled': return AlertCircle
      default: return Clock
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">{t('dash.orders_management')}</h1>
          <p className="text-sm text-muted-foreground">{t('dash.orders_desc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="font-bold text-2xl text-foreground">{orders.length}</span>
            <span className="text-muted-foreground ml-1">{t('dash.total_orders')}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('dash.search_orders')} 
            className="w-full pl-10 bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2 bg-card border border-border rounded-lg p-1">
          {['all', 'pending', 'paid', 'shipped', 'delivered'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                filter === f 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {t(`dash.${f}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {searchQuery ? t('dash.no_orders_search') : t('dash.no_orders')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map(order => {
            const StatusIcon = getStatusIcon(order.status)
            const isUpdating = updatingOrder === order.id

            return (
              <div key={order.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-bold text-lg font-mono text-primary">#{order.id.slice(0, 8)}</h3>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{t('dash.customer_label')}</span>
                        <span className="text-muted-foreground">{order.customer_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{t('dash.date_label')}</span>
                        <span className="text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('es-CO', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{t('dash.phone_label')}</span>
                        <span className="text-muted-foreground">{order.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{t('dash.city_label')}</span>
                        <span className="text-muted-foreground">{order.city || 'N/A'}</span>
                      </div>
                      <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                        <span className="font-semibold text-foreground">{t('dash.address_label')}</span>
                        <span className="text-muted-foreground">{order.shipping_address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-3 min-w-[200px] border-t lg:border-t-0 border-border pt-4 lg:pt-0 w-full lg:w-auto">
                    <div className="text-right">
                      <span className="text-2xl font-bold text-foreground">{formatCurrency(order.total)}</span>
                    </div>
                    
                    {isUpdating ? (
                      <div className="w-full bg-muted px-6 py-2 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'paid')}
                            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Package className="w-4 h-4" /> {t('dash.mark_paid')}
                          </button>
                        )}
                        {order.status === 'paid' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                            className="w-full bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Truck className="w-4 h-4" /> {t('dash.ship_order')}
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="w-full bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" /> {t('dash.mark_delivered')}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
