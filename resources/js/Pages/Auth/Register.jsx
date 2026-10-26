// resources/js/Pages/Auth/Register.jsx
import { useEffect, useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        currency: 'PHP',
    });

    const [currencySearch, setCurrencySearch] = useState('₱ - Philippine Peso (PHP)');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
            <Head title="Register" />
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Create an account</CardTitle>
                        <CardDescription>
                            Enter your details below to create your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-2">
                                <label htmlFor="name" className="text-sm font-medium leading-none">
                                    Full Name
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    placeholder="John Doe"
                                    autoComplete="name"
                                    autoFocus
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    placeholder="m@example.com"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            {/* Searchable Currency Dropdown */}
                            <div className="grid gap-2 relative" ref={dropdownRef}>
                                <label htmlFor="currency" className="text-sm font-medium leading-none">
                                    Preferred Currency
                                </label>
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
                                        className="bg-[#1a1a1a] text-foreground pr-8 cursor-pointer"
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {isOpen && (
                                    <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-[#1a1a1a] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm top-full">
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

                                {errors.currency && (
                                    <p className="text-sm text-destructive">{errors.currency}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="password" className="text-sm font-medium leading-none">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="password_confirmation" className="text-sm font-medium leading-none">
                                    Confirm Password
                                </label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                {errors.password_confirmation && (
                                    <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-4 text-center text-sm">
                            Already have an account?{' '}
                            <Link href={route('login')} className="underline">
                                Log in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}