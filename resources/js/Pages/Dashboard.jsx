// resources/js/Pages/Dashboard.jsx
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, DollarSign, CreditCard, Plus } from 'lucide-react';

export default function Dashboard() {
    return (
        <DashboardLayout headerTitle="Overview">
            <Head title="Dashboard" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
                    <p className="text-muted-foreground text-sm">Monitor your income, expenses, and monthly budget.</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add Transaction
                </Button>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12,450.00</div>
                        <p className="text-xs text-muted-foreground">+5.2% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$4,200.00</div>
                        <p className="text-xs text-muted-foreground">+12% from target</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                        <ArrowDownLeft className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$1,850.50</div>
                        <p className="text-xs text-muted-foreground">-3% compared to last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your latest transactions across all accounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
                            Transaction chart or table here
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Frequently performed tasks.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <CreditCard className="h-4 w-4" /> Transfer Money
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <DollarSign className="h-4 w-4" /> Download Statement
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}