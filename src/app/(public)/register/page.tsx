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

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRegisterSchema, RegisterValues } from '@/lib/validations/auth';
import { useMemo } from 'react';

export default function RegisterPage() {
    const { t, language, setLanguage } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const { user } = useAuth(); 
    const router = useRouter();

    const schema = useMemo(() => createRegisterSchema(t), [t, language]);

    // React Hook Form
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        }
    });

    useEffect(() => {
        if (user) {
            router.replace('/');
        }
    }, [user, router]);

	const onSubmit = async (data: RegisterValues) => {
        setLoading(true);
        setSubmitError(null);

		const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    full_name: data.name
                },
                emailRedirectTo: `${location.origin}/auth/callback`,
            }
        });

        if (error) {
            setSubmitError(error.message);
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

			<div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center z-10">
				{/* Visual Side (Hidden on Mobile) */}
				<div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
					<div className="space-y-6">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
								<svg
									className="w-7 h-7 text-primary-foreground"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
							<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
								ThunderXis
							</h1>
						</div>

						<div className="space-y-4">
							<h2 className="text-4xl font-bold leading-tight tracking-tight text-balance">
								{t('hero.title')}
							</h2>
							<p className="text-lg text-muted-foreground leading-relaxed">
								{t('hero.subtitle')}
							</p>
						</div>

						<div className="grid grid-cols-2 gap-4 pt-8">
							<div className="space-y-2 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
                                <h3 className="font-semibold text-primary">{t('auth.premium')}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{t('auth.premium.desc')}
								</p>
							</div>
							<div className="space-y-2 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
								<h3 className="font-semibold text-primary">{t('auth.style')}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{t('auth.style.desc')}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Form Side */}
				<div className="flex justify-center lg:justify-end">
					<Card className="w-full max-w-md border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
						<CardHeader className="space-y-2 pb-6">
							<div className="flex lg:hidden items-center gap-2 mb-4">
								<span className="text-xl font-bold text-primary">ThunderXis</span>
							</div>

							<CardTitle className="text-2xl font-bold tracking-tight">
								{t('auth.create')}
							</CardTitle>
							<CardDescription className="text-base">
								{t('auth.join.desc')}
							</CardDescription>
						</CardHeader>

						<CardContent>
							<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
								{submitError && (
									<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
										{submitError}
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
                                        className="h-11 bg-background/50"
                                        disabled={loading}
                                        {...register("name")}
									/>
                                    {errors.name && (
                                        <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
                                    )}
								</div>

								<div className="space-y-2">
									<Label htmlFor="email" className="text-sm font-medium">
										{t('auth.email')}
									</Label>
									<Input
										id="email"
										type="email"
                                        placeholder={t('auth.placeholder.email')}
                                        className="h-11 bg-background/50"
                                        disabled={loading}
                                        {...register("email")}
									/>
                                    {errors.email && (
                                        <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
                                    )}
								</div>

								<div className="space-y-2">
									<Label htmlFor="password" className="text-sm font-medium">
										{t('auth.password')}
									</Label>
									<Input
										id="password"
										type="password"
                                        placeholder={t('auth.placeholder.password')}
                                        className="h-11 bg-background/50"
                                        disabled={loading}
                                        {...register("password")}
									/>
                                     {errors.password && (
                                        <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
                                    )}
								</div>

								<Button
									type="submit"
									className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all"
									disabled={loading}>
									{loading ? t('loading.text') : t('auth.register')}
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
                            <Link href="/shop" className="w-full text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 pt-2">
                                ← {t('home.view_all')}
                            </Link>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}

