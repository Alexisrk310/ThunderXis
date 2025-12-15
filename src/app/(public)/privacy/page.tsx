'use client'

import { useLanguage } from '@/components/LanguageProvider'

export default function PrivacyPage() {
  const { t } = useLanguage()
  
  return (
    <div className="container mx-auto px-4 pt-32 pb-16 max-w-4xl min-h-screen">
      <div className="space-y-4 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground">
            {t('legal.privacy.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
            {t('legal.privacy.effective')} {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-muted-foreground">
        <p className="text-lg leading-relaxed mb-8">
            {t('legal.privacy.intro.desc')}
        </p>

        <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legal.privacy.collect.title')}</h2>
            <p className="mb-4 leading-relaxed">
                {t('legal.privacy.collect.desc')}
            </p>
        </section>

        <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legal.privacy.use.title')}</h2>
            <p className="mb-4 leading-relaxed">
                {t('legal.privacy.use.desc')}
            </p>
        </section>
      </div>
    </div>
  )
}
