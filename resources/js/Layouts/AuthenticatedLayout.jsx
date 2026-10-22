import { useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';
import { toast } from 'sonner';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

export default function AppLayout({ title = 'SpendWise', headerTitle = '', children }) {
    const { auth, flash, errors } = usePage().props;
    const user = auth?.user;

    // 1. Trigger toast on backend flash messages
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.warning) toast.warning(flash.warning);
        if (flash?.info) toast.info(flash.info);
    }, [flash]);

    // 2. Trigger toast on form validation errors
    useEffect(() => {
        const errorKeys = Object.keys(errors || {});
        if (errorKeys.length > 0) {
            const firstErrorMessage = errors[errorKeys[0]];
            toast.error(firstErrorMessage || 'Please complete all required fields.');
        }
    }, [errors]);

    return (
        <TooltipProvider>
            <SidebarProvider>
                <Head title={`${title} - SpendWise`} />

                <AppSidebar user={user} />

                <SidebarInset>
                    {headerTitle && (
                        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4 bg-zinc-800" />
                            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-200">
                                {headerTitle}
                            </h1>
                        </header>
                    )}

                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}