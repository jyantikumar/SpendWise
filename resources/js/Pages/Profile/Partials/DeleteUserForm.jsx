import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ShieldAlert, Trash2, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        clearErrors();
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <Card className={`border-destructive/30 bg-destructive/5 shadow-sm ${className}`}>
            <CardHeader>
                <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-destructive" /> Delete Account
                </CardTitle>
                <CardDescription>
                    Permanently delete your account and all associated transaction records.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xl mb-4">
                    Once your account is deleted, all of its resources and transaction history will be permanently wiped. Please download any data or records you wish to retain before proceeding.
                </p>

                <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={confirmUserDeletion}
                    className="gap-1.5"
                >
                    <Trash2 className="h-4 w-4" /> Delete Account
                </Button>

                <Dialog open={confirmingUserDeletion} onOpenChange={closeModal}>
                    <DialogContent className="sm:max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle className="text-destructive">
                                Are you sure you want to delete your account?
                            </DialogTitle>
                            <DialogDescription className="text-xs pt-1">
                                This action cannot be undone. Please enter your password to confirm you would like to permanently delete your account and data.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={deleteUser} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">Confirm Password</Label>
                                <Input
                                    id="confirm_password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your current password"
                                    autoFocus
                                />
                                {errors.password && (
                                    <p className="text-xs font-medium text-destructive">{errors.password}</p>
                                )}
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={closeModal} size="sm">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    size="sm"
                                    disabled={processing}
                                >
                                    {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    Confirm Deletion
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}