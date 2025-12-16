'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'

export default function AuthCodeError() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">{t('auth.error.title')}</h1>
      <p className="mb-6 text-muted-foreground">
        {t('auth.error.desc')}
      </p>
      <Link 
        href="/login"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
      >
        {t('auth.error.back')}
      </Link>
    </div>
  )
}
