'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Filter } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

export function Sidebar() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const currentGender = searchParams.get('gender')
  const currentCategory = searchParams.get('category')

  const isActive = (type: 'gender' | 'category', value: string) => {
    if (type === 'gender') return currentGender === value.toLowerCase()
    if (type === 'category') return currentCategory === value.toLowerCase()
    return false
  }

  return (
    <aside className="w-full md:w-64 space-y-8 h-fit hidden md:block">
       {/* Filters */}
       <div className="p-6 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-2 mb-6 text-primary">
             <Filter className="w-5 h-5" />
             <h3 className="font-bold">{t('filters.title')}</h3>
          </div>
          
          <div className="space-y-6">
             <div>
                <h4 className="text-sm font-medium mb-3 text-foreground/80">{t('filters.gender')}</h4>
                <div className="space-y-2">
                   <Link href="/shop?gender=men" className={`flex items-center gap-2 text-sm cursor-pointer transition-colors ${isActive('gender', 'men') ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary'}`}>
                      <div className={`w-4 h-4 border border-border rounded flex items-center justify-center ${isActive('gender', 'men') ? 'bg-primary border-primary' : 'bg-muted/50'}`}>
                          {isActive('gender', 'men') && <span className="text-white text-[10px]">✓</span>}
                      </div> 
                      {t('filters.men') || 'Men'}
                   </Link>
                    <Link href="/shop?gender=women" className={`flex items-center gap-2 text-sm cursor-pointer transition-colors ${isActive('gender', 'women') ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary'}`}>
                      <div className={`w-4 h-4 border border-border rounded flex items-center justify-center ${isActive('gender', 'women') ? 'bg-primary border-primary' : 'bg-muted/50'}`}>
                          {isActive('gender', 'women') && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      {t('filters.women') || 'Women'}
                   </Link>
                </div>
             </div>

             <div>
                <h4 className="text-sm font-medium mb-3 text-foreground/80">{t('filters.categories')}</h4>
                <div className="space-y-2 flex flex-col">
                   {['T-Shirts', 'Hoodies', 'Pants', 'Accessories', 'Caps'].map(cat => (
                      <Link 
                        key={cat} 
                        href={`/shop?category=${cat.toLowerCase()}`} 
                        className={`text-sm transition-colors py-1 ${isActive('category', cat) ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary'}`}
                      >
                         {cat}
                      </Link>
                   ))}
                </div>
             </div>
          </div>
       </div>
       
       {/* Promo Banner */}
       <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
          <h4 className="font-bold text-lg mb-2 relative z-10">{t('filters.banner.title') || 'Winter Sale'}</h4>
          <p className="text-sm text-muted-foreground mb-4 relative z-10">{t('filters.banner.desc') || 'Get up to 50% off.'}</p>
          <Link href="/descuentos" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline relative z-10">
             {t('filters.banner.cta') || 'View Offers'} &rarr;
          </Link>
       </div>
    </aside>
  )
}
