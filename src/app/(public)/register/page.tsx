'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
    const { t, language, setLanguage } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth(); // Get user
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.replace('/');
        }
    }, [user, router]);

	const [formData, setFormData] = useState({
        name: '',
		email: '',
		password: '',
	});

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
        setLoading(true);
        setError(null);

        // Client-side Validation
        if (!formData.name.trim()) {
            setError(t('auth.error.name_required'));
            setLoading(false);
            return;
        }
        if (!formData.email.trim()) {
            setError(t('auth.error.email_required'));
            setLoading(false);
            return;
        }
        if (!formData.password) {
             setError(t('auth.error.password_required'));
             setLoading(false);
             return;
        }
        if (formData.password.length < 6) {
            setError(t('auth.error.password_length'));
            setLoading(false);
            return;
        }

		const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.name
                },
                emailRedirectTo: `${location.origin}/auth/callback`,
            }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push(`/login?message=${t('auth.success.created')}`); 
        }
	}

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
             {/* Ambient Background */}
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Language Switcher */}
            <div className="absolute top-4 right-4 z-50">
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md p-1.5 rounded-full border border-border/50 shadow-sm">
                    <Globe className="w-4 h-4 ml-2 text-muted-foreground" />
                    <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer pr-2"
                    >
                        <option value="es">ES</option>
                        <option value="en">EN</option>
                        <option value="fr">FR</option>
                        <option value="pt">PT</option>
                    </select>
                </div>
            </div>

			<div className="w-full max-w-md z-10">
                <Card className="w-full border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
                    <CardHeader className="space-y-2 pb-6 text-center">
                        <Link href="/" className="flex justify-center mb-4">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ThunderXis</span>
                        </Link>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {t('auth.create')}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {t('auth.join.desc')}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    {t('auth.name')}
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder={t('auth.placeholder.name')}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="h-11 bg-background/50"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    {t('auth.email')}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t('auth.placeholder.email')}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="h-11 bg-background/50"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    {t('auth.password')}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={t('auth.placeholder.password')}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="h-11 bg-background/50"
                                    disabled={loading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all"
                                disabled={loading}>
                                {loading ? 'Cargando...' : t('auth.register')}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-border/50">
                        <p className="text-center text-sm text-muted-foreground">
                            {t('auth.have_account')}{' '}
                            <Link
                                href="/login"
                                className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                {t('auth.login')}
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
			</div>
		</div>
	);
}
