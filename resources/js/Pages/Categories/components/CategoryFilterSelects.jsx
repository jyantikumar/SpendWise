import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CategoryFilterSelects({ statusFilter, setStatusFilter, selectedTab, setSelectedTab }) {
    return (
        <div className="grid grid-cols-2 gap-2.5 w-full md:w-auto md:flex md:items-center">
            {/* Status Select */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-full md:w-[130px] border-zinc-800 text-zinc-300 bg-zinc-900">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent position="popper" align="start" className="border-zinc-800 bg-zinc-900 text-zinc-300">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="all">All Status</SelectItem>
                </SelectContent>
            </Select>

            {/* Type Select */}
            <Select value={selectedTab} onValueChange={setSelectedTab}>
                <SelectTrigger className="h-9 w-full md:w-[140px] border-zinc-800 text-zinc-300 bg-zinc-900">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent position="popper" align="start" className="border-zinc-800 bg-zinc-900 text-zinc-300">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}