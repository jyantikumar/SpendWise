import { useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Lock, Check, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <Card className={`border-border/60 shadow-sm ${className}`}>
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" /> Security & Password
                </CardTitle>
                <CardDescription>
                    Ensure your account is using a long, random password to stay secure.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={updatePassword} className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="current_password">Current Password</Label>
                        <Input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type="password"
                            autoComplete="current-password"
                        />
                        {errors.current_password && (
                            <p className="text-xs font-medium text-destructive">{errors.current_password}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            autoComplete="new-password"
                        />
                        {errors.password && <p className="text-xs font-medium text-destructive">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                        <Input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type="password"
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && (
                            <p className="text-xs font-medium text-destructive">{errors.password_confirmation}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={processing} size="sm">
                            {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Update Password
                        </Button>

                        {recentlySuccessful && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                                <Check className="h-3.5 w-3.5" /> Password updated.
                            </span>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}