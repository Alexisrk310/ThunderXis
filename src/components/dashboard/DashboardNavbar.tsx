'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, Bell, User, ChevronDown, Globe, LogOut, Menu } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import { useAuth } from '@/hooks/useAuth'
import { LogoutModal } from '@/components/LogoutModal'
import { motion, AnimatePresence } from 'framer-motion'

import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'

interface DashboardNavbarProps {
  onMenuClick: () => void
}

export function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const { language, setLanguage, t } = useLanguage()
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const { addToast } = useToast()
  

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activities, setActivities] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch initial activities
    const fetchActivities = async () => {
        const { data } = await supabase
            .from('dashboard_activities')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)
        
        if (data) {
            setActivities(data)
            // Calculare unread if we had a 'read' status logic, but for now just show count of new ones in session
        }
    }

    if (user?.role === 'owner') {
        fetchActivities()

        // Real-time subscription
        const channel = supabase
            .channel('dashboard-notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'dashboard_activities' },
                (payload) => {
                    const newActivity = payload.new
                    setActivities(prev => [newActivity, ...prev].slice(0, 10))
                    setUnreadCount(prev => prev + 1)
                    
                    // Toast formatted based on action
                    // Toast formatted based on action
                    const actionText = newActivity.action_type === 'ORDER_UPDATE' ? t('dash.activity.order_update') : 
                                     newActivity.action_type === 'USER_UPDATE' ? t('dash.activity.user_update') : t('dash.activity.new')
                    
                    addToast(`${actionText} por ${newActivity.actor_name}`, 'info')
                }
            )
            .subscribe()

        return () => {
             supabase.removeChannel(channel)
        }
    }
  }, [user, addToast])
  const handleLogout = async () => {
    setIsLogoutModalOpen(false)
    await signOut()
  }

  // Breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    return paths.map((path, index) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1),
      href: '/' + paths.slice(0, index + 1).join('/')
    }))
  }

  const breadcrumbs = getBreadcrumbs()

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' }
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-20 bg-background/95 backdrop-blur-md border-b border-border z-40 ml-0 lg:ml-64 transition-all duration-300">
        <div className="h-full px-6 flex items-center justify-between gap-6">
          
          {/* Left: Menu Toggle, Breadcrumbs & Search */}
          <div className="flex items-center gap-4 flex-1">
            <button 
                onClick={onMenuClick}
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  <Link 
                    href={crumb.href}
                    className={`font-medium transition-colors ${
                      index === breadcrumbs.length - 1 
                        ? 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {crumb.name}
                  </Link>
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-muted-foreground">/</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('dash.search_placeholder')}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen)
                    setUnreadCount(0)
                }}
                className="relative p-2.5 hover:bg-muted rounded-xl transition-colors group"
                title={t('dash.notifications')}
              >
                <Bell className={`w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors ${unreadCount > 0 ? 'animate-bounce text-primary' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl py-1 z-50 max-h-[400px] overflow-y-auto"
                  >
                    <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted/30">
                      <p className="text-sm font-bold text-foreground">{t('dash.activity.recent')}</p>
                      <button onClick={() => setUnreadCount(0)} className="text-xs text-muted-foreground hover:text-primary">
                        {t('dash.activity.mark_read')}
                      </button>
                    </div>

                    {activities.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-sm font-medium">
                        {t('dash.activity.empty')}
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {activities.map(activity => (
                          <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors cursor-default">
                             <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-xs text-primary uppercase tracking-wide">
                                    {activity.action_type?.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                             </div>
                             <p className="text-sm text-foreground mb-1 leading-snug">
                                {activity.description}
                             </p>
                             <div className="flex items-center gap-1.5 mt-2">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[8px] text-white font-bold">
                                    {activity.actor_name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">
                                    {activity.actor_name}
                                </span>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-xl transition-colors"
                title="Change Language"
              >
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-bold text-foreground hidden sm:block">
                  {languages.find(l => l.code === language)?.flag}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-2 z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as any)
                          setIsLangMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          language === lang.code 
                            ? 'bg-primary/10 text-primary font-bold' 
                            : 'text-foreground hover:bg-muted font-medium'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Info (Static) */}
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl border border-transparent">
               <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-background">
                 {user?.email?.charAt(0).toUpperCase()}
               </div>
               <div className="hidden md:block text-left mr-1">
                 <p className="text-sm font-bold text-foreground leading-tight">{user?.email?.split('@')[0]}</p>
                 <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{t('dash.owner')}</p>
               </div>
            </div>
          </div>
          </div>

      </nav>

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}
