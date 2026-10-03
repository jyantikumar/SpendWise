import { useRef, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { 
    User, 
    Lock, 
    ShieldAlert, 
    Check, 
    AlertCircle, 
    Trash2, 
    Loader2, 
    KeyRound, 
    MailCheck, 
    AlertTriangle,
    Eye,
    EyeOff
} from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

// --- Sub-Component: Update Profile Information Form ---
function UpdateProfileInformationForm({ mustVerifyEmail, status }) {
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
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile Details</h3>
                <p className="text-sm text-muted-foreground">
                    Update your account details and public information.
                </p>
            </div>
            <Separator />
            <form onSubmit={submit} className="space-y-6">
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
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-400 flex flex-col gap-2">
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

                <div className="flex items-center gap-3">
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
        </div>
    );
}

// --- Sub-Component: Update Password Form (With Password Visibility Toggles) ---
function UpdatePasswordForm() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

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
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Password & Security</h3>
                <p className="text-sm text-muted-foreground">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </div>
            <Separator />
            <form onSubmit={updatePassword} className="space-y-6">
                {/* Current Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <div className="relative">
                        <Input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type={showCurrentPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                        >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    {errors.current_password && (
                        <p className="text-xs font-medium text-destructive">{errors.current_password}</p>
                    )}
                </div>

                {/* New Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide new password' : 'Show new password'}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    {errors.password && <p className="text-xs font-medium text-destructive">{errors.password}</p>}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <div className="relative">
                        <Input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type={showPasswordConfirmation ? 'text' : 'password'}
                            autoComplete="new-password"
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            aria-label={showPasswordConfirmation ? 'Hide confirm password' : 'Show confirm password'}
                        >
                            {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    {errors.password_confirmation && (
                        <p className="text-xs font-medium text-destructive">{errors.password_confirmation}</p>
                    )}
                </div>

                <div className="flex items-center gap-3">
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
        </div>
    );
}

// --- Sub-Component: Delete User Form (With Password Visibility Toggle) ---
function DeleteUserForm() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const [showDeletePassword, setShowDeletePassword] = useState(false);
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
        setShowDeletePassword(false);
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                </p>
            </div>
            <Separator />
            <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
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
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-destructive">
                                Confirm Account Deletion
                            </DialogTitle>
                            <DialogDescription className="text-xs pt-1">
                                Please enter your password to confirm you want to permanently delete your account.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={deleteUser} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm_password"
                                        type={showDeletePassword ? 'text' : 'password'}
                                        name="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter current password"
                                        className="pr-10"
                                        autoFocus
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                                        aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
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
            </div>
        </div>
    );
}

// --- Main Page Component ---
export default function Edit({ auth, mustVerifyEmail, status }) {
    const user = auth?.user || {};

    const userInitials = user.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'US';

    return (
        <TooltipProvider>
            <SidebarProvider>
                <Head title="Account Settings - SpendWise" />

                <AppSidebar user={user} />

                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <h1 className="text-lg font-semibold tracking-tight">Account Settings</h1>
                    </header>

                    {/* Centered Main Container */}
                    <main className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full space-y-6">
                        {/* Settings Header Block */}
                        <div className="space-y-0.5">
                            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                            <p className="text-muted-foreground text-sm">
                                Manage your account settings and preferences.
                            </p>
                        </div>

                        <Separator />

                        {/* Profile Info Summary */}
                        
                        {/* Tabs Layout Block */}
                        <Tabs defaultValue="general" className="flex flex-col space-y-8 w-full pt-2">
                            {/* Horizontal Tabs Navigation */}
                            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 gap-6 h-auto">
                                <TabsTrigger 
                                    value="general" 
                                    className="gap-2 rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent shadow-none"
                                >
                                    <User className="h-4 w-4" />
                                    General
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="security" 
                                    className="gap-2 rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent shadow-none"
                                >
                                    <KeyRound className="h-4 w-4" />
                                    Security
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="danger" 
                                    className="gap-2 rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground data-[state=active]:border-destructive data-[state=active]:text-destructive data-[state=active]:bg-transparent shadow-none"
                                >
                                    <AlertTriangle className="h-4 w-4" />
                                    Danger Zone
                                </TabsTrigger>
                            </TabsList>

                            {/* Forms Below Tabs Navigation */}
                            <TabsContent value="general" className="mt-0">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </TabsContent>

                            <TabsContent value="security" className="mt-0">
                                <UpdatePasswordForm />
                            </TabsContent>

                            <TabsContent value="danger" className="mt-0">
                                <DeleteUserForm />
                            </TabsContent>
                        </Tabs>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}