export function AccountFilterTabs({ statusFilter, setStatusFilter }) {
    return (
        <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 w-full sm:w-auto">
            {['active', 'inactive', 'all'].map((status) => (
                <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`py-1.5 px-3 rounded-md text-xs font-medium capitalize text-center transition-all ${
                        statusFilter === status 
                            ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                            : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    {status}
                </button>
            ))}
        </div>
    );
}