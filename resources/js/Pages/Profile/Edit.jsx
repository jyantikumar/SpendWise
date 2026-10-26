import { useRef, useState, useEffect } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import { 
    User, 
    Check, 
    AlertCircle, 
    Trash2, 
    Loader2, 
    KeyRound, 
    AlertTriangle,
    Eye,
    EyeOff
} from 'lucide-react';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Comprehensive list of global currencies
const currencies = [
    { code: 'PHP', label: '₱ - Philippine Peso (PHP)' },
    { code: 'USD', label: '$ - US Dollar (USD)' },
    { code: 'EUR', label: '€ - Euro (EUR)' },
    { code: 'GBP', label: '£ - British Pound (GBP)' },
    { code: 'JPY', label: '¥ - Japanese Yen (JPY)' },
    { code: 'CAD', label: '$ - Canadian Dollar (CAD)' },
    { code: 'AUD', label: '$ - Australian Dollar (AUD)' },
    { code: 'SGD', label: '$ - Singapore Dollar (SGD)' },
    { code: 'KRW', label: '₩ - South Korean Won (KRW)' },
    { code: 'INR', label: '₹ - Indian Rupee (INR)' },
    { code: 'AED', label: 'د.إ - UAE Dirham (AED)' },
    { code: 'CHF', label: 'CHF - Swiss Franc (CHF)' },
    { code: 'CNY', label: '¥ - Chinese Yuan (CNY)' },
    { code: 'HKD', label: '$ - Hong Kong Dollar (HKD)' },
    { code: 'NZD', label: '$ - New Zealand Dollar (NZD)' },
    { code: 'THB', label: '฿ - Thai Baht (THB)' },
    { code: 'MYR', label: 'RM - Malaysian Ringgit (MYR)' },
    { code: 'IDR', label: 'Rp - Indonesian Rupiah (IDR)' },
    { code: 'VND', label: '₫ - Vietnamese Dong (VND)' },
];

function UpdateProfileInformationForm({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        currency: user.currency || 'PHP',
    });

    // Find initial currency label matching user's saved currency code
    const initialCurrencyObj = currencies.find((c) => c.code === (user.currency || 'PHP')) || currencies[0];
    const [currencySearch, setCurrencySearch] = useState(initialCurrencyObj.label);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Filter currencies based on user search input
    const filteredCurrencies = currencies.filter((curr) =>
        curr.label.toLowerCase().includes(currencySearch.toLowerCase()) ||
        curr.code.toLowerCase().includes(currencySearch.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-zinc-100">Profile Details</h3>
                <p className="text-sm text-zinc-400">
                    Update your account details and default preferences.
                </p>
            </div>
            <Separator className="bg-zinc-800" />
            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                        placeholder="John Doe"
                        className="border-zinc-800 text-zinc-200"
                    />
                    {errors.name && <p className="text-xs font-medium text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                        placeholder="name@example.com"
                        className="border-zinc-800 text-zinc-200"
                    />
                    {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
                </div>

                {/* Searchable Preferred Currency Dropdown */}
                <div className="space-y-2 relative" ref={dropdownRef}>
                    <Label htmlFor="currency" className="text-zinc-300">Preferred Currency</Label>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search currency..."
                            value={currencySearch}
                            onFocus={() => setIsOpen(true)}
                            onChange={(e) => {
                                setCurrencySearch(e.target.value);
                                setIsOpen(true);
                            }}
                            className="bg-[#1a1a1a] text-foreground pr-8 cursor-pointer border-zinc-800 text-zinc-200"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {isOpen && (
                        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-800 bg-[#1a1a1a] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm top-full">
                            {filteredCurrencies.length > 0 ? (
                                filteredCurrencies.map((curr) => (
                                    <li
                                        key={curr.code}
                                        onClick={() => {
                                            setData('currency', curr.code);
                                            setCurrencySearch(curr.label);
                                            setIsOpen(false);
                                        }}
                                        className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-foreground hover:bg-accent hover:text-accent-foreground"
                                    >
                                        {curr.label}
                                    </li>
                                ))
                            ) : (
                                <li className="cursor-default select-none py-2 px-3 text-muted-foreground">
                                    No currency found
                                </li>
                            )}
                        </ul>
                    )}

                    {errors.currency && <p className="text-xs font-medium text-destructive">{errors.currency}</p>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-400 flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-medium">
                            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                            Your email address is unverified.
                        </div>
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="underline text-xs hover:text-amber-200 text-left font-semibold w-fit"
                        >
                            Click here to re-send the verification email.
                        </Link>
                        {status === 'verification-link-sent' && (
                            <p className="text-xs font-medium text-emerald-400">
                                A new verification link has been sent to your email address.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button type="submit" disabled={processing} size="sm" className="w-full sm:w-auto">
                        {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Save Changes
                    </Button>

                    {recentlySuccessful && (
                        <span className="text-xs text-emerald-400 flex items-center justify-center sm:justify-start gap-1 font-medium">
                            <Check className="h-3.5 w-3.5" /> Saved successfully.
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}

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
                <h3 className="text-lg font-medium text-zinc-100">Password & Security</h3>
                <p className="text-sm text-zinc-400">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </div>
            <Separator className="bg-zinc-800" />
            <form onSubmit={updatePassword} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="current_password" className="text-zinc-300">Current Password</Label>
                    <div className="relative">
                        <Input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type={showCurrentPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            className="pr-10 border-zinc-800 text-zinc-200"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-zinc-400 hover:bg-transparent hover:text-zinc-200"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    {errors.current_password && (
                        <p className="text-xs font-medium text-destructive">{errors.current_password}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-300">New Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            className="pr-10 border-zinc-800 text-zinc-200"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-zinc-400 hover:bg-transparent hover:text-zinc-200"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    {errors.password && <p className="text-xs font-medium text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="text-zinc-300">Confirm Password</Label>
                    <div className="relative">
                        <Input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type={showPasswordConfirmation ? 'text' : 'password'}
                            autoComplete="new-password"
                            className="pr-10 border-zinc-800 text-zinc-200"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-zinc-400 hover:bg-transparent hover:text-zinc-200"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                        >
                            {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    {errors.password_confirmation && (
                        <p className="text-xs font-medium text-destructive">{errors.password_confirmation}</p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button type="submit" disabled={processing} size="sm" className="w-full sm:w-auto">
                        {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Update Password
                    </Button>

                    {recentlySuccessful && (
                        <span className="text-xs text-emerald-400 flex items-center justify-center sm:justify-start gap-1 font-medium">
                            <Check className="h-3.5 w-3.5" /> Password updated.
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}

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
                <p className="text-sm text-zinc-400">
                    Permanently delete your account and all associated data.
                </p>
            </div>
            <Separator className="bg-zinc-800" />
            <div className="space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                    Once your account is deleted, all of its resources and transaction history will be permanently wiped. Please download any data or records you wish to retain before proceeding.
                </p>

                <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={confirmUserDeletion}
                    className="w-full sm:w-auto gap-1.5"
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
                                        className="pr-10 border-zinc-800 text-zinc-200"
                                        autoFocus
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 text-zinc-400 hover:bg-transparent hover:text-zinc-200"
                                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                                    >
                                        {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs font-medium text-destructive">{errors.password}</p>
                                )}
                            </div>

                            <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2">
                                <Button type="button" variant="outline" onClick={closeModal} size="sm" className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    size="sm"
                                    disabled={processing}
                                    className="w-full sm:w-auto"
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

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AppLayout title="Account Settings" headerTitle="Account Settings">
            <div className="max-w-3xl mx-auto w-full space-y-6">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-100"></h2>
                    <p className="text-zinc-400 text-sm">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <Separator className="bg-zinc-800" />

                <Tabs defaultValue="general" className="flex flex-col space-y-8 w-full pt-2">
                    <TabsList className="w-full justify-start border-b border-zinc-800 rounded-none bg-transparent p-0 gap-4 sm:gap-6 h-auto overflow-x-auto no-scrollbar">
                        <TabsTrigger 
                            value="general" 
                            className="gap-2 rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-zinc-400 data-[state=active]:border-primary data-[state=active]:text-zinc-100 data-[state=active]:bg-transparent shadow-none whitespace-nowrap"
                        >
                            <User className="h-4 w-4" />
                            General
                        </TabsTrigger>
                        <TabsTrigger 
                            value="security" 
                            className="gap-2 rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-zinc-400 data-[state=active]:border-primary data-[state=active]:text-zinc-100 data-[state=active]:bg-transparent shadow-none whitespace-nowrap"
                        >
                            <KeyRound className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger 
                            value="danger" 
                            className="gap-2 rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-destructive data-[state=active]:border-destructive data-[state=active]:text-destructive data-[state=active]:bg-transparent shadow-none whitespace-nowrap"
                        >
                            <AlertTriangle className="h-4 w-4" />
                            Danger
                        </TabsTrigger>
                    </TabsList>

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
            </div>
        </AppLayout>
    );
}