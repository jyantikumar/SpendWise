import { 
    LayoutDashboard, 
    ReceiptText, 
    Wallet, 
    Tags, 
    User, 
    LogOut,
    Layers,
    DollarSign,
    ChevronUp,
    ChartLine,
    Calendar,
    ArrowLeftRight,
    Gift,
Users
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const navGroups = [
    {
        label: 'Main',
        items: [
            { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
            { title: 'Transactions', url: '/transactions', icon: ReceiptText },
            { title: 'Split Payments', url: '/splits', icon: Users },
            { title: 'Recurring Payments', url: '/subscriptions', icon: Calendar },
            { title: 'Wishlist', url: '/wishlist', icon: Gift },

            { title: 'Analysis', url: '/analysis', icon: ChartLine },
        ],
    },
    {
        label: 'Configuration',
        items: [
            { title: 'Accounts', url: '/accounts', icon: Wallet },
            { title: 'Account Types', url: '/account-types', icon: Layers },
            { title: 'Categories', url: '/categories', icon: Tags },
            { title: 'Data Management', url: '/settings/data', icon: ArrowLeftRight }, // 👈 2. Added here!
        ],
    },
];

export function AppSidebar({ user }) {
    const { url } = usePage();

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <Sidebar 
            collapsible="icon" 
            className="border-r border-zinc-800 bg-background text-zinc-100 [&>div]:border-none shadow-none"
        >
            {/* Header / Brand Logo */}
            <SidebarHeader className="border-b border-zinc-800">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            size="lg" 
                            asChild 
                            className="!bg-transparent hover:!bg-transparent active:!bg-transparent"
                        >
                            <Link href="/dashboard">
                                <div className="flex aspect-square h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 font-bold">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-zinc-100">SpendWise</span>
                                    <span className="truncate text-xs text-zinc-400">Finance Tracker</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Navigation Items */}
            <SidebarContent>
                {navGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel className="text-zinc-500 font-medium text-xs uppercase tracking-wider">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const isActive = url.startsWith(item.url);

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton 
                                                asChild 
                                                isActive={isActive} 
                                                tooltip={item.title}
                                                className={`!bg-transparent text-zinc-300 hover:text-zinc-100 hover:!bg-zinc-800/40 ${
                                                    isActive ? '!bg-zinc-800 !text-zinc-100 font-semibold' : ''
                                                }`}
                                            >
                                                <Link href={item.url} className="flex items-center gap-3">
                                                    <item.icon className="h-4 w-4 text-zinc-100" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* User Profile Footer */}
            <SidebarFooter className="border-t border-zinc-800">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button 
                                    type="button" 
                                    className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-zinc-800/50 hover:text-zinc-100 outline-none transition-colors text-zinc-300"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 font-medium text-xs text-zinc-100 border border-zinc-700">
                                        {user?.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold text-zinc-100">{user?.name}</span>
                                        <span className="truncate text-xs text-zinc-400">{user?.email}</span>
                                    </div>
                                    <ChevronUp className="ml-auto h-4 w-4 text-zinc-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width] border-zinc-800 bg-background text-zinc-300">
                                <DropdownMenuItem asChild className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                                    <Link href={route('profile.edit')} className="flex items-center">
                                        <User className="mr-2 h-4 w-4 text-zinc-400" /> Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout} className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4 text-rose-400" /> Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}