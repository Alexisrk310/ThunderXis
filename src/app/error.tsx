'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

import { useLanguage } from '@/components/LanguageProvider'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLanguage()

  useEffect(() => {
    // Log the error to an error reporting service (later: Sentry)
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center space-y-6 max-w-md mx-auto p-8 rounded-3xl bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
                <AlertCircle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {t('error.title')}
                </h2>
                <p className="text-muted-foreground">
                    {t('error.desc')}
                </p>
                {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs font-mono text-destructive/80 bg-destructive/10 p-2 rounded mt-2 break-all">
                        {error.message}
                    </p>
                )}
            </div>

            <div className="pt-4 space-y-3">
                <Button 
                    onClick={reset}
                    size="lg" 
                    className="w-full font-bold bg-foreground text-background hover:bg-foreground/90"
                >
                    {t('error.retry')}
                </Button>
                <Button 
                    variant="ghost" 
                    onClick={() => window.location.href = '/'}
                    className="w-full text-muted-foreground hover:text-foreground"
                >
                    {t('error.home')}
                </Button>
            </div>
        </div>
    </div>
  )
}
