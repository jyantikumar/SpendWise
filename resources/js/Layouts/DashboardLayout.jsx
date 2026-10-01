// resources/js/Layouts/DashboardLayout.jsx
import { Link, usePage } from '@inertiajs/react';
import { TooltipProvider } from '@/components/ui/tooltip'; // <--- Import TooltipProvider
import { 
    SidebarProvider, 
    Sidebar, 
    SidebarContent, 
    SidebarHeader, 
    SidebarFooter, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton, 
    SidebarGroup, 
    SidebarGroupLabel, 
    SidebarGroupContent, 
    SidebarTrigger, 
    SidebarInset 
} from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard, Wallet, CreditCard, Settings, LogOut, ChevronUp, User } from 'lucide-react';

export default function DashboardLayout({ children, headerTitle = "Dashboard" }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const navItems = [
        { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { title: 'Transactions', icon: CreditCard, href: '#' },
        { title: 'Wallets', icon: Wallet, href: '#' },
        { title: 'Settings', icon: Settings, href: '/profile' },
    ];

    return (
        <TooltipProvider>
            <SidebarProvider>
                <Sidebar collapsible="icon">
                    <SidebarHeader className="border-b border-sidebar-border p-4">
                        <div className="flex items-center gap-2 font-bold text-lg text-sidebar-foreground">
                            <Wallet className="h-6 w-6 text-primary" />
                            <span className="group-data-[collapsible=icon]:hidden">SpendWise</span>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Menu</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navItems.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild tooltip={item.title}>
                                                <Link href={item.href}>
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="border-t border-sidebar-border p-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="uppercase">{user.name.slice(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                                                <span className="text-sm font-semibold truncate">{user.name}</span>
                                                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                            </div>
                                            <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="top" className="w-56">
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile" className="flex items-center gap-2">
                                                <User className="h-4 w-4" /> Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/logout" method="post" as="button" className="w-full flex items-center gap-2 text-destructive">
                                                <LogOut className="h-4 w-4" /> Log Out
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="/dashboard">Application</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{headerTitle}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>

                    <main className="flex-1 p-6 space-y-6">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}