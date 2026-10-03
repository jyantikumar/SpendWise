import { Link, useForm, usePage } from '@inertiajs/react';
import { User, Check, AlertCircle, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function UpdateProfileInformationForm({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <Card className={`border-border/60 shadow-sm ${className}`}>
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Profile Details
                </CardTitle>
                <CardDescription>
                    Update your display name and primary email address.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={submit} className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="John Doe"
                        />
                        {errors.name && <p className="text-xs font-medium text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="name@example.com"
                        />
                        {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-400 flex flex-col gap-2">
                            <div className="flex items-center gap-2 font-medium">
                                <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                                Your email address is unverified.
                            </div>
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline text-xs hover:text-amber-800 dark:hover:text-amber-200 text-left font-semibold w-fit"
                            >
                                Click here to re-send the verification email.
                            </Link>
                            {status === 'verification-link-sent' && (
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    A new verification link has been sent to your email address.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={processing} size="sm">
                            {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Save Changes
                        </Button>

                        {recentlySuccessful && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                                <Check className="h-3.5 w-3.5" /> Saved successfully.
                            </span>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}