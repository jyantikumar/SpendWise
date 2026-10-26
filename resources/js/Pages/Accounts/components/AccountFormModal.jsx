// resources/js/Pages/Accounts/components/AccountFormModal.jsx
import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { BadgeCheck, BadgeX, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';

import AccountTypeFormModal from '@/Pages/AccountTypes/components/AccountTypeFormModal';

// Preset Hex Color Palette
const HEX_PRESETS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#64748B', // Slate
];

export default function AccountFormModal({
    isOpen,
    onClose,
    editingAccount = null,
    accountTypes = [],
    onSuccessCallback,
    userCurrency = 'PHP'
}) {
    const isEditing = Boolean(editingAccount);
    const [isAccountTypeModalOpen, setIsAccountTypeModalOpen] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: accountTypes[0]?.name || '',
        balance: '0.00',
        color: '#3B82F6',
        is_active: true,
    });

    useEffect(() => {
        if (!isOpen) return;

        clearErrors();

        if (editingAccount) {
            setData({
                name: editingAccount.name || '',
                type: editingAccount.type || accountTypes[0]?.name || '',
                balance: editingAccount.balance ? String(editingAccount.balance) : '0.00',
                color: editingAccount.color || '#3B82F6',
                is_active: Boolean(editingAccount.is_active),
            });
        } else {
            reset();
            setData({
                name: '',
                type: accountTypes[0]?.name || '',
                balance: '0.00',
                color: '#3B82F6',
                is_active: true,
            });
        }
    }, [isOpen, editingAccount, accountTypes]);

    const handleAccountTypeCreated = (page) => {
        const updatedTypes = page.props.accountTypes || [];
        const latestType = updatedTypes[updatedTypes.length - 1];
        if (latestType) {
            setData('type', latestType.name);
        }
    };

    const handleHexInputChange = (e) => {
        let val = e.target.value;
        if (!val.startsWith('#')) {
            val = '#' + val.replace(/#/g, '');
        }
        setData('color', val.toUpperCase());
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('accounts.update', editingAccount.id), {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast.success('Account updated successfully.');
                    onClose();
                    reset();
                    if (onSuccessCallback) onSuccessCallback(page);
                },
                onError: () => {
                    toast.error('Failed to update account.');
                },
            });
        } else {
            post(route('accounts.store'), {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast.success('Account created successfully.');
                    onClose();
                    reset();
                    if (onSuccessCallback) onSuccessCallback(page);
                },
                onError: () => {
                    toast.error('Failed to create account.');
                },
            });
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                        <DialogDescription>
                            Set up your financial account details and balance. All accounts automatically use your preferred currency ({userCurrency}).
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Account Name</label>
                            <Input
                                placeholder="e.g., BDO Savings, GCash, Maya"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Account Type</label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsAccountTypeModalOpen(true)}
                                    className="h-6 px-2 text-xs text-primary gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Quick Add
                                </Button>
                            </div>
                            <Select 
                                value={data.type} 
                                onValueChange={(value) => setData('type', value)}
                            >
                                <SelectTrigger className="w-full h-10 border-zinc-800 text-zinc-300">
                                    <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                                <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[280px]">
                                    {accountTypes && accountTypes.length > 0 ? (
                                        accountTypes.map((typeObj) => (
                                            <SelectItem key={typeObj.id || typeObj.name} value={typeObj.name}>
                                                <div className="flex items-center gap-2">
                                                    {typeObj.color && (
                                                        <span 
                                                            className="h-2.5 w-2.5 rounded-full shrink-0" 
                                                            style={{ backgroundColor: typeObj.color }}
                                                        />
                                                    )}
                                                    <span>{typeObj.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-xs text-center text-muted-foreground">
                                            No account types found.
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-xs text-rose-500">{errors.type}</p>}
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Initial Balance</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={data.balance}
                                onChange={(e) => setData('balance', e.target.value)}
                            />
                            {errors.balance && <p className="text-xs text-rose-500">{errors.balance}</p>}
                        </div>

                        {/* Hex Color Swatches + Manual Hex Code Input */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Account Color (Hex Code)</label>
                            
                            {/* Swatches Grid */}
                            <div className="flex flex-wrap items-center gap-2 py-1">
                                {HEX_PRESETS.map((hex) => (
                                    <button
                                        key={hex}
                                        type="button"
                                        onClick={() => setData('color', hex)}
                                        style={{ backgroundColor: hex }}
                                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none ${
                                            data.color === hex ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-105' : ''
                                        }`}
                                    >
                                        {data.color === hex && <Check className="h-3.5 w-3.5 text-white drop-shadow-sm" />}
                                    </button>
                                ))}
                            </div>

                            {/* Hex Input Field */}
                            <div className="flex items-center gap-3 w-full mt-1">
                                <div 
                                    className="w-10 h-10 rounded-lg border border-zinc-700 shrink-0 shadow-sm"
                                    style={{ backgroundColor: data.color.length === 7 ? data.color : '#3B82F6' }}
                                />

                                <Input 
                                    type="text"
                                    maxLength={7}
                                    value={data.color}
                                    onChange={handleHexInputChange}
                                    className="flex-1 h-10 font-mono text-xs uppercase border-zinc-800"
                                    placeholder="#3B82F6"
                                />
                            </div>
                            {errors.color && <p className="text-xs text-rose-500">{errors.color}</p>}
                        </div>

                        <div className="flex items-center justify-between border border-zinc-800 rounded-lg p-3 bg-muted/20">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Active Status</label>
                                    {data.is_active ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1 text-[11px] px-2 py-0">
                                            <BadgeCheck className="h-3 w-3" /> Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="gap-1 text-zinc-400 border-zinc-800 text-[11px] px-2 py-0">
                                            <BadgeX className="h-3 w-3" /> Inactive
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-400">Include in overall portfolio balance</p>
                            </div>
                            <Switch
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', checked)}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {isEditing ? 'Save Changes' : 'Create Account'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AccountTypeFormModal 
                isOpen={isAccountTypeModalOpen}
                onClose={() => setIsAccountTypeModalOpen(false)}
                onSuccessCallback={handleAccountTypeCreated}
            />
        </>
    );
}