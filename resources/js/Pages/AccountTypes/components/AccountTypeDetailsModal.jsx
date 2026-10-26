// resources/js/Pages/AccountTypes/components/AccountTypeDetailsModal.jsx
import { useState, useEffect, useMemo } from 'react';
import { 
    Search, 
    Wallet, 
    ChevronLeft,
    ChevronRight,
    Landmark,
    ChevronRight as ArrowRight
} from 'lucide-react';

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import AccountTransactionsSheet from '@/Pages/AccountTypes/components/AccountTransactionsSheet';

const ITEMS_PER_PAGE = 5;

export default function AccountTypeDetailsModal({ 
    isOpen, 
    onClose, 
    accountType,
    categories = [],
    userCurrency = 'PHP' 
}) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const accounts = useMemo(() => accountType?.accounts || [], [accountType]);
    
    const totalBalance = useMemo(() => {
        return accountType?.total_balance ?? accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
    }, [accountType, accounts]);

    const formatCurrency = (val, currency = userCurrency) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || userCurrency }).format(val || 0);

    // Reset search, pagination & selected account when modal opens/changes
    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setCurrentPage(1);
            setSelectedAccount(null);
        }
    }, [isOpen, accountType]);

    // Client-side search filtering
    const filteredAccounts = useMemo(() => {
        if (!search.trim()) return accounts;
        const query = search.toLowerCase();
        return accounts.filter((acc) => acc.name.toLowerCase().includes(query));
    }, [accounts, search]);

    // Client-side pagination calculations
    const totalItems = filteredAccounts.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    const paginatedAccounts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAccounts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredAccounts, currentPage]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    if (!accountType) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[720px] max-h-[90vh] sm:max-h-[85vh] flex flex-col p-4 sm:p-6 border-zinc-800 bg-background overflow-hidden">
                    {/* Header */}
                    <DialogHeader className="pb-3 border-b border-zinc-800 shrink-0">
                        <div className="flex items-center justify-between pr-8 sm:pr-10 gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div 
                                    className="h-4 w-4 rounded-full shrink-0" 
                                    style={{ backgroundColor: accountType.color || '#3b82f6' }}
                                />
                                <div className="min-w-0">
                                    <DialogTitle className="text-lg sm:text-xl font-bold text-zinc-200 truncate">
                                        {accountType.name}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-zinc-400 mt-0.5 truncate">
                                        Linked accounts & valuation breakdown. Tap account to view transactions.
                                    </DialogDescription>
                                </div>
                            </div>

                            {/* Total Balance Badge */}
                            <div className="shrink-0">
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
                                    Total: {formatCurrency(totalBalance, userCurrency)}
                                </Badge>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Filter / Search Bar */}
                    <div className="flex items-center justify-between gap-2.5 py-3 border-b border-zinc-800 bg-zinc-900/40 -mx-4 px-4 sm:-mx-6 sm:px-6 shrink-0">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                            <Input
                                placeholder="Search accounts..."
                                value={search}
                                onChange={handleSearchChange}
                                className="pl-8 h-8 text-xs w-full border-zinc-800 text-zinc-300"
                            />
                        </div>

                        <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-400 text-xs px-2.5 h-8 shrink-0 flex items-center gap-1.5 font-normal">
                            <Landmark className="h-3.5 w-3.5 text-zinc-500" />
                            <span>{totalItems} {totalItems === 1 ? 'account' : 'accounts'}</span>
                        </Badge>
                    </div>

                    {/* Accounts Table Container */}
                    <div className="flex-1 overflow-y-auto min-h-[220px] my-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {paginatedAccounts.length > 0 ? (
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow className="border-b border-zinc-800">
                                        <TableHead className="text-zinc-400">Account Name</TableHead>
                                        <TableHead className="text-right text-zinc-400">Current Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedAccounts.map((acc) => (
                                        <TableRow 
                                            key={acc.id} 
                                            onClick={() => setSelectedAccount(acc)}
                                            className="border-b border-zinc-800 hover:bg-muted/50 transition-colors cursor-pointer group"
                                        >
                                            <TableCell className="font-medium text-xs text-zinc-300">
                                                <div className="flex items-center gap-2.5">
                                                    <Wallet className="h-3.5 w-3.5 text-zinc-500 shrink-0 group-hover:text-zinc-300" />
                                                    <span className="truncate">{acc.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-xs whitespace-nowrap text-emerald-400">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* 👈 Strictly use global userCurrency */}
                                                    <span>{formatCurrency(acc.balance, userCurrency)}</span>
                                                    <ArrowRight className="h-3 w-3 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-400">
                                <Wallet className="h-8 w-8 stroke-1 mb-2 opacity-50" />
                                <p className="text-sm font-medium text-zinc-300">No linked accounts found</p>
                                <p className="text-xs opacity-75 mt-0.5">
                                    {search ? 'Try adjusting your search terms.' : 'No accounts are assigned to this account type.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {totalItems > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-zinc-800 pt-3 text-xs text-zinc-400 shrink-0">
                            <div>
                                Showing <span className="font-medium text-zinc-200">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                                <span className="font-medium text-zinc-200">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of{' '}
                                <span className="font-medium text-zinc-200">{totalItems}</span> accounts
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    className="h-7 px-2 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                                </Button>

                                <span className="text-xs font-medium text-zinc-300 px-1">
                                    {currentPage} / {totalPages}
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    className="h-7 px-2 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                                >
                                    Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Slide-out Account Transactions Drawer Sheet */}
            <AccountTransactionsSheet
                isOpen={!!selectedAccount}
                onClose={() => setSelectedAccount(null)}
                account={selectedAccount}
                categories={categories}
                userCurrency={userCurrency}
            />
        </>
    );
}