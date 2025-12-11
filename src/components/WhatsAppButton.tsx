'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

export function WhatsAppButton() {
  const { t } = useLanguage()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Tooltip text */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="bg-card border border-border px-3 py-1.5 rounded-full text-xs font-medium shadow-lg hidden md:block"
        >
            {t('whatsapp.chat')}
        </motion.div>

        <motion.a
        href="https://wa.me/573000000000" // Replace with real number
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.5)] flex items-center justify-center hover:bg-[#128C7E] transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        >
        <MessageCircle className="w-8 h-8" />
        </motion.a>
    </div>
  )
}
