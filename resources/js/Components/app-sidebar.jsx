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
        <Sidebar collapsible="icon">
            {/* Header / Brand Logo */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">SpendWise</span>
                                    <span className="truncate text-xs text-muted-foreground">Finance Tracker</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Navigation Items */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={url === item.url} tooltip={item.title}>
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
            {/* User Profile Footer in resources/js/components/app-sidebar.jsx */}
<SidebarFooter>
    <SidebarMenu>
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button 
                        type="button" 
                        className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground outline-none transition-colors"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-medium text-xs">
                            {user?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{user?.name}</span>
                            <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                        <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                    <DropdownMenuItem asChild>
                        <Link href={route('profile.edit')} className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" /> Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    </SidebarMenu>
</SidebarFooter>
        </Sidebar>
    );
}