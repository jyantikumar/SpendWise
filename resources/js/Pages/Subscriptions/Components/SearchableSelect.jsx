// resources/js/Pages/Subscriptions/Components/SearchableSelect.jsx
import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

/**
 * A dark-themed, type-to-search dropdown built on Popover + Command.
 *
 * Props:
 *  - value:        string | number | null   (current selected id)
 *  - onValueChange:(value: string) => void  (called with the picked item's value)
 *  - options:      Array<{ value: string|number, label: string }>
 *  - placeholder:  string                   (shown when nothing selected)
 *  - searchPlaceholder: string              (input placeholder)
 *  - emptyText:    string                   (shown when no match)
 *  - disabled:     boolean
 *  - className:    string                   (applied to the trigger button)
 */
export function SearchableSelect({
    value,
    onValueChange,
    options = [],
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    emptyText = 'No results.',
    disabled = false,
    className,
}) {
    const [open, setOpen] = useState(false);

    const selected = options.find(
        (opt) => String(opt.value) === String(value ?? '')
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'h-9 w-full justify-between border-zinc-800 bg-zinc-900 text-xs text-zinc-200 font-normal hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-60 disabled:cursor-not-allowed',
                        !selected && 'text-zinc-500',
                        className
                    )}
                >
                    <span className="truncate">
                        {selected ? selected.label : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 border-zinc-800 bg-zinc-900 text-zinc-200"
                align="start"
            >
                <Command
                    className="bg-zinc-900 text-zinc-200"
                    // simple substring filter; cmdk's default is fine but
                    // we lowercase both sides for a forgiving match
                    filter={(value, search) =>
                        value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
                    }
                >
                    <CommandInput
                        placeholder={searchPlaceholder}
                        className="h-9 text-xs text-zinc-200 placeholder:text-zinc-500"
                    />
                    <CommandList className="max-h-[240px] overflow-y-auto">
                        <CommandEmpty className="py-4 text-center text-[11px] text-zinc-500">
                            {emptyText}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((opt) => {
                                const isSelected =
                                    String(opt.value) === String(value ?? '');
                                return (
                                    <CommandItem
                                        key={String(opt.value)}
                                        // cmdk filters on `value`, so feed it the label
                                        // (the human-readable text) — not the id.
                                        value={opt.label}
                                        onSelect={() => {
                                            onValueChange(String(opt.value));
                                            setOpen(false);
                                        }}
                                        className="text-xs text-zinc-200 aria-selected:bg-zinc-800 aria-selected:text-zinc-100 cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-3.5 w-3.5',
                                                isSelected ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        <span className="truncate">{opt.label}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}