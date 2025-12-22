'use client'

import React from 'react'
import { Product } from '@/store/useCartStore'
import ProductCard from '@/features/store/components/ProductCard'
import { useLanguage } from '@/components/LanguageProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Timer, Zap } from 'lucide-react'

interface DiscountsClientProps {
  products: Product[]
}

export default function DiscountsClient({ products }: DiscountsClientProps) {
  const { t } = useLanguage()

  // Calculate stats
  const maxDiscount = products.reduce((max, product) => {
    if (!product.sale_price) return max;
    const discount = Math.round(((product.price - product.sale_price) / product.price) * 100);
    return discount > max ? discount : max;
  }, 0);

  return (
    <div className="min-h-screen bg-white text-purple-950 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-100/60 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-100/60 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
        
        {/* Banner Section */}
        <div className="relative pt-36 pb-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6 border border-purple-100 shadow-sm">
                        <Zap className="w-4 h-4 fill-current" />
                        {t('discounts.exclusive_offers')}
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter text-purple-950">
                        {t('nav.discounts')} <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-500">
                            {t('discounts.premium')}
                        </span>
                    </h1>
                    
                    {maxDiscount > 0 && (
                        <p className="text-xl md:text-2xl font-bold text-purple-800 max-w-2xl mx-auto leading-relaxed flex items-center justify-center gap-3">
                           <span className="bg-purple-600 text-white px-3 py-1 rounded-lg shadow-lg rotate-3 inline-block">{t('discounts.save_up_to')} {maxDiscount}%</span> 
                           {t('discounts.on_selected')}
                        </p>
                    )}
                </motion.div>
            </div>
        </div>

      <div className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
        {products.length === 0 ? (
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center bg-white/50 backdrop-blur-sm border border-purple-100 rounded-3xl shadow-xl shadow-purple-200/50 p-12 max-w-2xl mx-auto"
            >
                 <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Tag className="w-12 h-12 text-purple-600" />
                 </div>
                 <h2 className="text-3xl font-bold text-purple-950 mb-4">{t('discounts.no_active')}</h2>
                 <p className="text-purple-600/80 mb-10 max-w-md font-medium">
                    {t('discounts.updating_inventory')}
                 </p>
                 <a href="/shop" className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1">
                    {t('discounts.back_to_shop')}
                 </a>
             </motion.div>
        ) : (
             <>
                <div className="flex items-center gap-6 mb-12">
                    <div className="h-px flex-1 bg-purple-200" />
                    <span className="text-sm font-bold text-purple-500 uppercase tracking-widest flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-purple-100 shadow-sm">
                        <Timer className="w-4 h-4" /> {t('discounts.limited_time')}
                    </span>
                    <div className="h-px flex-1 bg-purple-200" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence>
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ProductCard product={product} index={index} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
             </>
        )}
      </div>
    </div>
  )
}
