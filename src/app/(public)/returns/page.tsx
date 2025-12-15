'use client'

import { useLanguage } from '@/components/LanguageProvider'

export default function ReturnsPage() {
  const { t } = useLanguage()

  return (
    <div className="container mx-auto px-4 pt-32 pb-16 max-w-4xl min-h-screen">
      <div className="space-y-4 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground">
            {t('legal.returns.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
            {t('legal.returns.subtitle')}
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-muted-foreground">
        <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legal.returns.guarantee.title')}</h2>
            <p className="leading-relaxed">
                {t('legal.returns.guarantee.desc')}
            </p>
        </section>

        <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legal.returns.conditions.title')}</h2>
            <p className="leading-relaxed">
                 {t('legal.returns.conditions.desc')}
            </p>
        </section>
      </div>
    </div>
  )
}
