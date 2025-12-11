'use client'

import React from 'react'
import { Sidebar } from '@/components/Sidebar' // Assuming I'll create this or use from page.tsx refactor
import ProductCard from '@/features/store/components/ProductCard'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Link from 'next/link'

// This would typically fetch from Supabase based on slug
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Cyberpunk Hoodie 2077',
    price: 89.99,
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
    category: 'Hoodies',
    description: 'High-quality hooded sweatshirt with cyberpunk aesthetics.',
    isNew: true
  },
  {
    id: '4',
    name: 'Void Black Tee',
    price: 35.00,
    image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
    category: 'T-Shirts',
    description: 'Premium cotton t-shirt in void black.',
    isNew: false
  },
]

export default function CategoryPage() {
  const params = useParams()
  const category = (params.slug as string) || 'All'

  return (
    <div className="min-h-screen bg-background pb-20 pt-24"> {/* Added pt-24 for navbar spacing */}
       <div className="max-w-7xl mx-auto px-6">
          
          {/* Breadcrumbs */}
          <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
             <Link href="/" className="hover:text-primary">Home</Link>
             <span>/</span>
             <Link href="/shop" className="hover:text-primary">Shop</Link>
             <span>/</span>
             <span className="text-foreground capitalize">{category}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-12">
             <Sidebar />
             
             <div className="flex-1">
                 <h1 className="text-4xl font-bold mb-8 capitalize">{category}</h1>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_PRODUCTS.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                           <ProductCard product={product} />
                        </motion.div>
                    ))}
                 </div>
                 
                 {MOCK_PRODUCTS.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        No products found in this category.
                    </div>
                 )}
             </div>
          </div>
       </div>
    </div>
  )
}
