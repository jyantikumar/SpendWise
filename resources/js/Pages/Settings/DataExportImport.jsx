import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Download, Upload, Database, FileSpreadsheet, FileUp, CheckCircle2, ArrowRightLeft, Layers, FileDown, AlertTriangle, Trash2 } from 'lucide-react';

export default function DataExportImport() {
    const [mode, setMode] = useState('export'); // 'export' | 'import' | 'clear'
    const [format, setFormat] = useState('json'); // 'json' | 'csv'
    const [scope, setScope] = useState('all'); // 'all' | 'transactions'
    const [showClearModal, setShowClearModal] = useState(false);

    const jsonForm = useForm({ file: null });
    const csvForm = useForm({ file: null });
    const clearForm = useForm({});
    const activeImportForm = format === 'json' ? jsonForm : csvForm;

    const handleExport = () => {
        if (format === 'json') {
            window.location.href = route('settings.data.export.json') + `?scope=${scope}`;
        } else {
            window.location.href = route('settings.data.export.csv');
        }
    };

    const handleDownloadTemplate = () => {
        if (format === 'json') {
            const templateData = {
                version: "1.0",
                exported_at: new Date().toISOString(),
                account_types: [
                    { name: "Bank", color: "#3b82f6", icon: "wallet" }
                ],
                accounts: [
                    { name: "Checking Account", type: "Bank", balance: 1000.00, is_active: true }
                ],
                categories: [
                    { name: "Salary", type: "income", color: "#22c55e", icon: "briefcase" },
                    { name: "Groceries", type: "expense", color: "#ef4444", icon: "shopping-cart" }
                ],
                transactions: [
                    {
                        account_id: 1,
                        category_id: 2,
                        type: "expense",
                        amount: 150.50,
                        description: "Weekly supermarket run",
                        transaction_date: new Date().toISOString().split('T')[0] + " 12:00:00",
                        reference_number: "REF-001"
                    }
                ]
            };
            const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'spendwise-import-template.json';
            a.click();
            URL.revokeObjectURL(url);
        } else {
            const csvContent = "Date,Type,Amount,Account,Destination Account,Category,Description,Reference Number\n" +
                new Date().toISOString().split('T')[0] + " 12:00:00,expense,150.50,Checking Account,,Groceries,Weekly supermarket run,REF-001";
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'spendwise-transactions-template.csv';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (format === 'json') {
            jsonForm.post(route('settings.data.import.json'), { onSuccess: () => jsonForm.reset('file') });
        } else {
            csvForm.post(route('settings.data.import.csv'), { onSuccess: () => csvForm.reset('file') });
        }
    };

    const handleClearData = (e) => {
        e.preventDefault();
        clearForm.delete(route('settings.data.clear'), {
            onSuccess: () => setShowClearModal(false),
        });
    };

    return (
        <AuthenticatedLayout title="Data Management" headerTitle="Data Management & Portability">
            <div className="max-w-5xl mx-auto w-full px-4 sm:px-0 space-y-4">
                
                {/* Main Command Center Card */}
                <Card className={`shadow-lg overflow-hidden transition-colors ${mode === 'clear' ? 'border-destructive/30 bg-zinc-900' : 'border-zinc-800 bg-zinc-900'}`}>
                    <CardHeader className="space-y-1 pb-0 border-b border-zinc-800/80">
                        <div className="flex items-center justify-between pb-2">
                            <CardTitle className={`text-sm font-semibold flex items-center gap-2 ${mode === 'clear' ? 'text-destructive' : 'text-zinc-100'}`}>
                                {mode === 'clear' ? <AlertTriangle className="h-4 w-4" /> : <ArrowRightLeft className="h-4 w-4 text-zinc-400" />}
                                {mode === 'clear' ? 'Danger Zone' : 'Data Portability Hub'}
                            </CardTitle>
                        </div>
                        <CardDescription className="text-zinc-400 text-xs pb-3">
                            {mode === 'clear' ? 'Permanently delete workspace logs and records.' : 'Backup workspace records or migrate logs securely.'}
                        </CardDescription>

                        {/* Top-Level Mode Switcher: Underline Tabs */}
                        <div className="flex border-b border-zinc-800/80 gap-6">
                            <button
                                type="button"
                                onClick={() => setMode('export')}
                                className={`pb-2.5 text-xs font-medium transition-all relative flex items-center gap-1.5 ${
                                    mode === 'export'
                                        ? 'text-zinc-100 border-b-2 border-zinc-100 -mb-[1px]'
                                        : 'text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent -mb-[1px]'
                                }`}
                            >
                                <Download className="h-3.5 w-3.5" /> Export Data
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('import')}
                                className={`pb-2.5 text-xs font-medium transition-all relative flex items-center gap-1.5 ${
                                    mode === 'import'
                                        ? 'text-zinc-100 border-b-2 border-zinc-100 -mb-[1px]'
                                        : 'text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent -mb-[1px]'
                                }`}
                            >
                                <Upload className="h-3.5 w-3.5" /> Import Data
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('clear')}
                                className={`pb-2.5 text-xs font-medium transition-all relative flex items-center gap-1.5 ${
                                    mode === 'clear'
                                        ? 'text-destructive border-b-2 border-destructive -mb-[1px]'
                                        : 'text-zinc-400 hover:text-destructive border-b-2 border-transparent -mb-[1px]'
                                }`}
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Clear Account Data
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5 pt-5 text-xs">
                        
                        {/* MODE: EXPORT */}
                        {mode === 'export' && (
                            <>
                                {/* 1. Format Selection */}
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-500" /> Select File Format
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setFormat('json'); }}
                                            className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                                                format === 'json'
                                                    ? ' border-zinc-600 text-zinc-100 shadow-sm'
                                                    : ' border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                            }`}
                                        >
                                            <Database className="h-4 w-4 shrink-0 text-zinc-300" />
                                            <div>
                                                <div className="font-medium text-zinc-200">JSON Format</div>
                                                <div className="text-[10px] text-zinc-500">Structured system backup</div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => { setFormat('csv'); setScope('transactions'); }}
                                            className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                                                format === 'csv'
                                                    ? 'border-zinc-600 text-zinc-100 shadow-sm'
                                                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                            }`}
                                        >
                                            <FileSpreadsheet className="h-4 w-4 shrink-0 text-zinc-300" />
                                            <div>
                                                <div className="font-medium text-zinc-200">CSV Spreadsheet</div>
                                                <div className="text-[10px] text-zinc-500">Spreadsheet table log</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* 2. Scope Selection */}
                                {format === 'json' && (
                                    <div className="space-y-2 pt-3 border-t border-zinc-800/80 animate-in fade-in-50 duration-150">
                                        <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Layers className="h-3.5 w-3.5 text-zinc-500" /> Choose Export Scope
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setScope('all')}
                                                className={`p-3 rounded-lg border text-left transition-all ${
                                                    scope === 'all'
                                                        ? ' border-zinc-700 text-zinc-100 shadow-sm'
                                                        : ' border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                                }`}
                                            >
                                                <div className="font-medium text-zinc-200">Entire Workspace</div>
                                                <div className="text-[10px] text-zinc-500 mt-0.5">Accounts, categories & ledgers</div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setScope('transactions')}
                                                className={`p-3 rounded-lg border text-left transition-all ${
                                                    scope === 'transactions'
                                                        ? 'border-zinc-600 text-zinc-100 shadow-sm'
                                                        : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                                }`}
                                            >
                                                <div className="font-medium text-zinc-200">Transactions Only</div>
                                                <div className="text-[10px] text-zinc-500 mt-0.5">Ledger records exclusively</div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* MODE: IMPORT */}
                        {mode === 'import' && (
                            <>
                                {/* 1. Format Selection */}
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-500" /> Select File Format
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormat('json')}
                                            className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                                                format === 'json'
                                                    ? ' border-zinc-600 text-zinc-100 shadow-sm'
                                                    : ' border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                            }`}
                                        >
                                            <Database className="h-4 w-4 shrink-0 text-zinc-300" />
                                            <div>
                                                <div className="font-medium text-zinc-200">JSON Format</div>
                                                <div className="text-[10px] text-zinc-500">Structured system backup</div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFormat('csv')}
                                            className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                                                format === 'csv'
                                                    ? 'border-zinc-600 text-zinc-100 shadow-sm'
                                                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                            }`}
                                        >
                                            <FileSpreadsheet className="h-4 w-4 shrink-0 text-zinc-300" />
                                            <div>
                                                <div className="font-medium text-zinc-200">CSV Spreadsheet</div>
                                                <div className="text-[10px] text-zinc-500">Spreadsheet table log</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* 2. File Upload Dropzone */}
                                <div className="space-y-3 pt-3 border-t border-zinc-800/80 animate-in fade-in-50 duration-150">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                            Upload {format.toUpperCase()} File
                                        </Label>
                                        <button
                                            type="button"
                                            onClick={handleDownloadTemplate}
                                            className="text-[11px] text-zinc-400 hover:text-zinc-100 flex items-center gap-1.5 transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-zinc-400"
                                        >
                                            <FileDown className="h-3.5 w-3.5" /> Download {format.toUpperCase()} Template
                                        </button>
                                    </div>

                                    <form onSubmit={handleImportSubmit} id="custom-import-form">
                                        <div className="relative border border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg bg-zinc-950/40 p-4 text-center transition-all group">
                                            <input
                                                type="file"
                                                accept={format === 'json' ? '.json' : '.csv, .txt'}
                                                key={format}
                                                onChange={(e) => activeImportForm.setData('file', e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="flex items-center justify-center gap-2.5">
                                                <div className="p-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-zinc-200 transition-all">
                                                    {activeImportForm.data.file ? (
                                                        <CheckCircle2 className="h-4 w-4 text-zinc-100" />
                                                    ) : (
                                                        <FileUp className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    {activeImportForm.data.file ? (
                                                        <div className="font-medium text-zinc-200 text-xs truncate max-w-[280px]">
                                                            {activeImportForm.data.file.name}
                                                        </div>
                                                    ) : (
                                                        <div className="font-medium text-zinc-300 text-xs">
                                                            Click or drop file here
                                                        </div>
                                                    )}
                                                    <div className="text-[10px] text-zinc-500">
                                                        Accepts .{format} files
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {activeImportForm.errors.file && (
                                            <p className="text-[11px] text-zinc-300 mt-1 font-medium">{activeImportForm.errors.file}</p>
                                        )}
                                    </form>
                                </div>
                            </>
                        )}

                        {/* MODE: CLEAR */}
                        {mode === 'clear' && (
                            <div className="space-y-3 pt-1 animate-in fade-in-50 duration-150">
                                <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-2">
                                    <div className="font-medium text-destructive text-xs flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                                        Destructive Workspace Action
                                    </div>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                                        Clearing your account data will permanently wipe out all transactions, recurring items, custom categories, accounts, and account types. Your login credentials will remain active, but all financial history will be reset to a blank slate.
                                    </p>
                                </div>
                            </div>
                        )}

                    </CardContent>

                    <CardFooter className="pt-3 pb-4 border-t border-zinc-800/80 bg-zinc-950/20">
                        {mode === 'export' && (
                            <Button 
                                onClick={handleExport}
                                className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-medium text-xs h-9 shadow-sm transition-all"
                            >
                                <Download className="mr-2 h-3.5 w-3.5" /> Download {format.toUpperCase()} Archive
                            </Button>
                        )} 
                        {mode === 'import' && (
                            <Button 
                                type="submit" 
                                form="custom-import-form" 
                                disabled={activeImportForm.processing || !activeImportForm.data.file} 
                                className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-medium text-xs h-9 shadow-sm transition-all disabled:opacity-40"
                            >
                                <Upload className="mr-2 h-3.5 w-3.5" /> 
                                {activeImportForm.processing ? 'Processing...' : `Upload & Process ${format.toUpperCase()}`}
                            </Button>
                        )}
                        {mode === 'clear' && (
                            <Button 
                                type="button" 
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowClearModal(true)}
                                className="w-full gap-1.5 text-xs h-9 font-medium"
                            >
                                <Trash2 className="h-4 w-4" /> Clear Account Data
                            </Button>
                        )}
                    </CardFooter>
                </Card>

            </div>

            {/* Confirmation Modal */}
            {showClearModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in-50">
                    <Card className="max-w-md w-full border-destructive/30 bg-zinc-900 shadow-2xl text-xs">
                        <CardHeader className="space-y-1 pb-2 border-b border-zinc-800">
                            <CardTitle className="text-destructive text-sm font-semibold flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" /> Are you absolutely sure?
                            </CardTitle>
                            <CardDescription className="text-zinc-400 text-xs">
                                This action will permanently erase all transactions, recurring items, accounts, categories, and account types linked to your workspace.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <p className="text-zinc-300 font-medium">
                                We strongly recommend downloading a JSON backup archive before proceeding.
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 border-t border-zinc-800 bg-zinc-950/30 pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowClearModal(false)}
                                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs h-8"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleClearData}
                                disabled={clearForm.processing}
                                className="text-xs h-8 font-medium"
                            >
                                {clearForm.processing ? 'Clearing...' : 'Yes, Delete Everything'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </AuthenticatedLayout>
    );
}