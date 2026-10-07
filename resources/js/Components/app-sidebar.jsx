// resources/js/components/app-sidebar.jsx
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
    ChartLine 
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

const navItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Transactions', url: '/transactions', icon: ReceiptText },
    { title: 'Accounts', url: '/accounts', icon: Wallet },
    { title: 'Account Types', url: '/account-types', icon: Layers },
    { title: 'Categories', url: '/categories', icon: Tags },
    { title: 'Analysis', url: '/analysis', icon: ChartLine },
];

export function AppSidebar({ user }) {
    const { url } = usePage();

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <Sidebar collapsible="icon" className="border-r border-zinc-800">
            {/* Header / Brand Logo */}
            <SidebarHeader className="border-b border-zinc-800">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-zinc-200">SpendWise</span>
                                    <span className="truncate text-xs text-zinc-400">Finance Tracker</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Navigation Items */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-zinc-400">Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={url === item.url} 
                                        tooltip={item.title}
                                        className="text-zinc-300 hover:text-zinc-100 data-[active=true]:bg-zinc-800/60 data-[active=true]:text-zinc-100"
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
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
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 font-medium text-xs text-zinc-200 border border-zinc-700">
                                        {user?.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold text-zinc-200">{user?.name}</span>
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