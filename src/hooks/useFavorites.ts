'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { useLanguage } from '@/components/LanguageProvider'

export function useFavorites() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [favorites, setFavorites] = useState<string[]>([]) // Array of Product IDs
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
        setFavorites([])
        setLoading(false)
        return
    }

    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id)

      if (error) {
        // If error is empty object, it might be a connection issue or missing table
        console.error('Error fetching favorites:', JSON.stringify(error, null, 2))
        // Silent fail for now to avoid disrupting user experience, but log for debug
      } else {
        setFavorites(data.map((fav: any) => fav.product_id))
      }
      setLoading(false)
    }

    fetchFavorites()
  }, [user])

  const toggleFavorite = async (productId: string, productData?: any) => {
    if (!user) {
        addToast(t('favorites.login_required'), 'warning')
        return
    }

    const isFavorite = favorites.includes(productId)

    if (isFavorite) {
        // Remove
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId)
        
        if (error) {
            addToast(t('favorites.error_remove'), 'error')
        } else {
            setFavorites(prev => prev.filter(id => id !== productId))
            addToast(t('favorites.removed'), 'info')
        }
    } else {
        // Add
        const { error } = await supabase
            .from('favorites')
            .insert({
                user_id: user.id,
                product_id: productId,
                product_data: productData // Snapshot for easy display
            })

        if (error) {
            console.error(error)
            addToast(t('favorites.error_add'), 'error')
        } else {
            setFavorites(prev => [...prev, productId])
            addToast(t('favorites.added'), 'success')
        }
    }
  }

  const isFavorite = (productId: string) => favorites.includes(productId)

  return {
    favorites, // List of IDs
    loading,
    toggleFavorite,
    isFavorite
  }
}
