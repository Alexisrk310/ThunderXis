
'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import ProductCard from '@/features/store/components/ProductCard'
import { useLanguage } from '@/components/LanguageProvider'

import { supabase } from '@/lib/supabase/client'
import { Product } from '@/store/useCartStore'

export default function ShopPage() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  // const { isFavorite, favorites } = useFavorites() // Temporarily disabled sorting by favorites to simplify first pass
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Get active filters
  const categoryFilter = searchParams.get('category')
  const genderFilter = searchParams.get('gender')

  useEffect(() => {
    fetchProducts()
  }, [categoryFilter, genderFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let query = supabase.from('products').select('*')

      if (categoryFilter) {
        query = query.ilike('category', categoryFilter)
      }

      if (genderFilter) {
        query = query.eq('gender', genderFilter)
      }

      const { data, error } = await query
      
      if (error) throw error
      
      if (data) {
        setProducts(data as Product[])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Memoize filtered products (Client side sorting/filtering if needed, currently mostly handled by DB)
  /* 
  const filteredProducts = useMemo(() => {
     // ... logic if needed later
     return products
  }, [products]) 
  */

  return (
    <div className="min-h-screen bg-background pb-20 pt-24">      
      <div className="max-w-7xl mx-auto px-6">
         <div className="flex flex-col md:flex-row gap-12">
            
            {/* Sidebar Filters */}
            <div className="sticky top-24 h-fit hidden md:block">
                <Sidebar />
            </div>

            {/* Product Grid */}
            <div className="flex-1">
               <div className="flex justify-between items-center mb-8">
                  <div>
                      <h1 className="text-3xl font-bold">{t('nav.shop')}</h1>
                      {(categoryFilter || genderFilter) && (
                          <div className="flex gap-2 mt-2">
                             {categoryFilter && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full uppercase">{categoryFilter}</span>}
                             {genderFilter && <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full uppercase">{genderFilter}</span>}
                          </div>
                      )}
                  </div>
                  <span className="text-sm text-muted-foreground">{products.length} items</span>
               </div>
               
               {loading ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-muted/20 animate-pulse rounded-2xl" />
                        ))}
                   </div>
               ) : products.length === 0 ? (
                   <div className="text-center py-20 bg-muted/10 rounded-3xl border border-white/5">
                        <p className="text-lg text-muted-foreground">{t('shop.no_results')}</p>
                        <button onClick={() => window.location.href = '/shop'} className="mt-4 text-primary hover:underline">{t('shop.clear_filters')}</button>
                   </div>
               ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
               )}
            </div>

         </div>
      </div>
    </div>
  )
}
