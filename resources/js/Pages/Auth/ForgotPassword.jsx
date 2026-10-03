import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, KeyRound, Loader2, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
            <Head title="Forgot Password" />
            <div className="w-full max-w-sm">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 text-primary">
                            <KeyRound className="h-5 w-5" />
                            <CardTitle className="text-xl font-bold">Find Account</CardTitle>
                        </div>
                        <CardDescription>
                            Enter your registered email address to verify your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {status && (
                            <div className="mb-4 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        placeholder="name@example.com"
                                        autoComplete="username"
                                        autoFocus
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="pl-9"
                                    />
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                {errors.email && (
                                    <p className="text-xs font-medium text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Continue to Reset Password
                            </Button>
                        </form>

                        <div className="mt-4 text-center">
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Back to login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}