'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, Globe, Menu, X, LogIn, Package } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { useLanguage } from '@/components/LanguageProvider'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { LogoutModal } from '@/components/LogoutModal'

export default function Navbar() {
  const { items, toggleCart } = useCartStore()
  const { language, setLanguage, t } = useLanguage()
  const { user, role } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const pathname = usePathname()
  const isAuthPage = ['/login', '/register'].includes(pathname)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle Logout
  const handleLogout = async () => {
    setIsLogoutModalOpen(false)
    await supabase.auth.signOut()
    window.location.reload()
  }

  // Hide navbar on auth pages AND dashboard
  const isDashboard = pathname.startsWith('/dashboard')
  if (isAuthPage || isDashboard) return null
  
  // User Name (Metadata)
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-panel border-b border-white/5 h-16' : 'h-20 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* Replaced Icon with AI Logo Image */}
          <div className="relative w-10 h-10 overflow-hidden rounded-lg group-hover:scale-105 transition-transform">
             <img src="/logo-thunder.png" alt="ThunderXis" className="object-cover w-full h-full" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ThunderXis
          </span>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">{t('nav.home')}</Link>
            <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors">{t('nav.shop')}</Link>
             <Link href="/descuentos" className="text-sm font-medium hover:text-primary transition-colors">{t('nav.discounts')}</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
           {/* Language Switcher */}
           <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors flex items-center gap-1"
              >
                  <span className="text-lg">
                    {language === 'es' ? '🇪🇸' : language === 'en' ? '🇺🇸' : language === 'fr' ? '🇫🇷' : '🇧🇷'}
                  </span>
                  <span className="text-xs uppercase font-bold">{language}</span>
              </button>
              
              <AnimatePresence>
                {isLangMenuOpen && (
                    <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 10 }}
                       className="absolute top-full right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden min-w-[120px]"
                    >
                        {(['es', 'en', 'fr', 'pt'] as const).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => {
                                    setLanguage(lang)
                                    setIsLangMenuOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors flex items-center gap-2 ${language === lang ? 'text-primary font-bold' : ''}`}
                            >
                                <span className="text-lg">
                                  {lang === 'es' ? '🇪🇸' : lang === 'en' ? '🇺🇸' : lang === 'fr' ? '🇫🇷' : '🇧🇷'}
                                </span>
                                <span className="uppercase">{lang}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
              </AnimatePresence>
           </div>
        
            {/* Cart Icon */}
           <button 
             onClick={() => toggleCart()} 
             className="relative p-2 hover:bg-white/5 rounded-full transition-colors"
           >
              <Link href="/cart">
                 <ShoppingCart className="w-5 h-5" />
                 {items.length > 0 && (
                   <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full animate-bounce">
                     {items.length}
                   </span>
                 )}
              </Link>
           </button>

           {/* Auth Section with Dropdown */}
           {user ? (
               <div className="relative group">
                   <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                       <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white">
                            {userName.charAt(0).toUpperCase()}
                       </div>
                       <span className="text-sm font-medium max-w-[100px] truncate hidden sm:block">{userName}</span>
                   </button>

                   {/* Dropdown */}
                   <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                       <div className="p-3 border-b border-border/50">
                           <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('nav.account')}</p>
                           <p className="text-sm font-medium truncate">{user.email}</p>
                       </div>
                       <div className="p-2">
                           <Link href="/my-orders" className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                               <Package className="w-4 h-4" />
                               {t('nav.orders')}
                           </Link>
                            <Link href="/favorites" className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                                <span className="text-red-500">❤️</span>
                                {t('nav.favorites')}
                            </Link>
                            {role === 'owner' && (
                              <Link href="/dashboard" className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                                  <User className="w-4 h-4" />
                                  {t('nav.dashboard')}
                              </Link>
                            )}
                           <button 
                                onClick={() => setIsLogoutModalOpen(true)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors text-left"
                            >
                               <LogIn className="w-4 h-4 rotate-180" />
                               {t('auth.logout')}
                           </button>
                       </div>
                   </div>
               </div>
           ) : (
               <div className="flex items-center gap-3">
                   {/* Generic Orders Button for Guests */}
                   <Link 
                        href="/login" 
                        className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        title={t('nav.orders_tooltip')}
                   >
                        <Package className="w-4 h-4" />
                        <span>{t('nav.orders')}</span>
                   </Link>

                   <Link href="/login" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-bold transition-all">
                       {t('auth.login')}
                   </Link>
               </div>
           )}

           {/* Mobile Menu Toggle */}
           <button className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
               <Menu className="w-6 h-6" />
           </button>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
          {isMobileMenuOpen && (
              <motion.div
                 initial={{ opacity: 0, x: '100%' }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: '100%' }}
                 className="fixed inset-0 bg-background z-[60] flex flex-col p-6"
              >
                 <div className="flex justify-between items-center mb-8">
                     <span className="font-bold text-xl">Menu</span>
                     <button onClick={() => setIsMobileMenuOpen(false)}>
                         <X className="w-6 h-6" />
                     </button>
                 </div>
                 
                <div className="flex flex-col gap-6 text-lg font-medium">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.home')}</Link>
                    <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.shop')}</Link>
                    <Link href="/descuentos" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.discounts')}</Link>
                    
                    <div className="h-px bg-border/50 my-2" />
                    
                    {user ? (
                        <>
                            <Link href="/my-orders" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.orders') || 'My Orders'}</Link>
                            <button onClick={() => { setIsLogoutModalOpen(true); setIsMobileMenuOpen(false) }} className="text-left text-red-500">
                                {t('auth.logout') || 'Logout'}
                            </button>
                        </>
                    ) : (
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>{t('auth.login')}</Link>
                    )}
                </div>
              </motion.div>
          )}
      </AnimatePresence>
      
      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </nav>
  )
}
