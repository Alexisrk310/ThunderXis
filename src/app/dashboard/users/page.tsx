'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Search, Mail, Shield, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/components/LanguageProvider'
import { TableSkeleton, StatsCardSkeleton } from '@/components/dashboard/skeletons'

import { Modal } from '@/components/ui/Modal'

interface User {
  id: string
  email: string
  created_at: string
  role: 'user' | 'owner'
  full_name?: string
}

export default function DashboardUsers() {
  const { t } = useLanguage()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal States
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    type: 'delete' | 'role' | null
    userId: string | null
    userData: any | null
  }>({
    isOpen: false,
    type: null,
    userId: null,
    userData: null
  })

  // Loading states for actions
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, full_name, created_at')
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setUsers(data as User[])
      }
    } catch (e) {
      console.error('Error fetching users:', e)
    } finally {
      setLoading(false)
    }
  }

  const openRoleModal = (user: User) => {
    setModalConfig({
        isOpen: true,
        type: 'role',
        userId: user.id,
        userData: user
    })
  }

  const openDeleteModal = (user: User) => {
    setModalConfig({
        isOpen: true,
        type: 'delete',
        userId: user.id,
        userData: user
    })
  }

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: null, userId: null, userData: null })
  }

  const handleConfirmAction = async () => {
    if (!modalConfig.userId || !modalConfig.type) return

    setActionLoading(true)
    try {
        if (modalConfig.type === 'role') {
            const currentRole = modalConfig.userData.role
            const newRole = currentRole === 'owner' ? 'user' : 'owner'
            
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', modalConfig.userId)
            
            if (error) throw error
        } 
        else if (modalConfig.type === 'delete') {
            const { error } = await supabase.rpc('delete_user_by_id', {
                user_id: modalConfig.userId
            })
            
            if (error) throw error
        }

        await fetchUsers()
        closeModal()
    } catch (e: any) {
        console.error('Error:', e)
        const errorMsg = modalConfig.type === 'delete' ? t('dash.error_delete_user') : t('dash.error_role_change')
        alert(`${errorMsg}: ${e.message || ''}`)
    } finally {
        setActionLoading(false)
    }
  }

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('dash.user_management')}</h1>
          <p className="text-muted-foreground">{t('dash.user_desc')}</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('dash.search_users')} 
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Warning Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-amber-500">{t('dash.warning_zone')}</p>
          <p className="text-muted-foreground">{t('dash.role_warning')}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-4">
             <TableSkeleton rows={8} columns={4} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {searchTerm ? t('dash.no_users_search') : t('dash.no_users')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">{t('dash.user')}</th>
                  <th className="px-6 py-4">{t('dash.role')}</th>
                  <th className="px-6 py-4">{t('dash.joined')}</th>
                  <th className="px-6 py-4 text-right">{t('dash.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                          {(user.full_name || user.email)?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-foreground">
                            {user.full_name || user.email?.split('@')[0]}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openRoleModal(user)}
                        className={`group relative px-3 py-1.5 rounded-lg text-xs font-bold border transition-all min-w-[80px] hover:scale-105 ${
                          user.role === 'owner' 
                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/30 hover:bg-purple-500/20' 
                            : 'bg-blue-500/10 text-blue-500 border-blue-500/30 hover:bg-blue-500/20'
                        }`}
                      >
                        <Shield className="w-3 h-3 inline mr-1" />
                        {user.role.toUpperCase()}
                        
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {t('dash.click_toggle')}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openDeleteModal(user)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-all group"
                        title={t('dash.delete_user')}
                      >
                        <Trash2 className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
             <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card/50 border border-border/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">{t('dash.total_users')}</p>
            <p className="text-2xl font-black text-foreground">{users.length}</p>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">{t('dash.owners')}</p>
            <p className="text-2xl font-black text-purple-500">{users.filter(u => u.role === 'owner').length}</p>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">{t('dash.regular_users')}</p>
            <p className="text-2xl font-black text-blue-500">{users.filter(u => u.role === 'user').length}</p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirmAction}
        isLoading={actionLoading}
        title={
            modalConfig.type === 'delete' 
                ? t('dash.delete_user') 
                : t('dash.role')
        }
        description={
            modalConfig.type === 'delete'
                ? t('dash.delete_confirm_user').replace('{email}', modalConfig.userData?.email || '')
                : t('dash.role_change_confirm').replace('{role}', modalConfig.userData?.role === 'owner' ? 'USER' : 'OWNER')
        }
        confirmText={t('dash.actions')}
        variant={modalConfig.type === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  )
}
