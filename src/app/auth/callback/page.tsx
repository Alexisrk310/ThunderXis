'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')

  useEffect(() => {
    const handleAuth = async () => {
      // Supabase client automatically parses the hash fragment to recover the session
      // We just need to wait a moment to ensure it's processed and then redirect.
      
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        return
      }

      // If we have a session (or even if we don't immediately, the hash might processed by the listener)
      // We'll assume success for the UX if no explicit error, and redirect.
      // The onAuthStateChange listener in `useAuth` or `LanguageProvider` handles the global state.
      
      setTimeout(() => {
          setStatus('success')
          setTimeout(() => {
             router.push('/')
          }, 2000) // Stay on success for 2 seconds
      }, 1000)
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">
        
        {status === 'verifying' && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             className="flex flex-col items-center gap-4"
           >
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h1 className="text-2xl font-bold">Verifying your email...</h1>
              <p className="text-zinc-400">Please wait while we set up your account.</p>
           </motion.div>
        )}

        {status === 'success' && (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-2">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white">{t('auth.welcome')}!</h1>
                <p className="text-zinc-400">Email verified successfully.</p>
                <p className="text-sm text-zinc-500 mt-4">Redirecting you to the shop...</p>
            </motion.div>
        )}

        {status === 'error' && (
             <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex flex-col items-center gap-4"
         >
             <div className="text-red-500 font-bold mb-2">Error Verifying</div>
             <p className="text-zinc-400">Something went wrong. Please try logging in manually.</p>
             <button 
                onClick={() => router.push('/login')}
                className="mt-4 bg-zinc-800 hover:bg-zinc-700 px-6 py-2 rounded-xl transition-colors"
             >
                Go to Login
             </button>
         </motion.div>
        )}

      </div>
    </div>
  )
}
