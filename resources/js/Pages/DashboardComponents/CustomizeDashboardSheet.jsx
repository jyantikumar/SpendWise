// resources/js/Pages/DashboardComponents/CustomizeDashboardSheet.jsx
import { useEffect, useState } from 'react';
import { LayoutGrid, RotateCcw, GripVertical, Loader2 } from 'lucide-react';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { http } from '@/lib/axios';

export default function CustomizeDashboardSheet({
    open,
    onOpenChange,
    initialWidgets = [],
    onSaved,
}) {
    const [widgets, setWidgets] = useState([]);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);

    // Sync from props each time the sheet opens
    useEffect(() => {
        if (open) setWidgets(initialWidgets.map((w) => ({ ...w })));
    }, [open, initialWidgets]);

    const toggleVisibility = (key) => {
        setWidgets((prev) =>
            prev.map((w) => (w.key === key ? { ...w, visible: !w.visible } : w))
        );
    };

    const handleDragStart = (index) => setDragIndex(index);

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;
        setWidgets((prev) => {
            const next = [...prev];
            const [moved] = next.splice(dragIndex, 1);
            next.splice(index, 0, moved);
            return next;
        });
        setDragIndex(index);
    };

    const handleDragEnd = () => setDragIndex(null);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await http.put('/dashboard/widgets', {
                widgets: widgets.map((w) => ({ key: w.key, visible: w.visible })),
            });

            // Lift the resolved widget list back to Dashboard
            if (onSaved) onSaved(data.widgets);
            onOpenChange(false);
        } catch (err) {
            console.error('Failed to save dashboard layout', err);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Reset dashboard layout to defaults?')) return;

        setResetting(true);
        try {
            const { data } = await http.delete('/dashboard/widgets');

            if (onSaved) onSaved(data.widgets);
            onOpenChange(false);
        } catch (err) {
            console.error('Failed to reset dashboard layout', err);
        } finally {
            setResetting(false);
        }
    };

    const busy = saving || resetting;

    // Group widgets for display, preserving drag order
    const groups = widgets.reduce((acc, w) => {
        (acc[w.group] = acc[w.group] || []).push(w);
        return acc;
    }, {});

    return (
        <Sheet open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md border-l border-zinc-800 bg-zinc-950 text-zinc-100 p-0 flex flex-col"
            >
                <SheetHeader className="p-4 sm:p-6 pb-3 border-b border-zinc-800">
                    <SheetTitle className="flex items-center gap-2 text-zinc-100">
                        <LayoutGrid className="h-4 w-4 text-emerald-500" />
                        Customize Dashboard
                    </SheetTitle>
                    <SheetDescription className="text-zinc-400 text-xs">
                        Toggle widgets on or off, and drag to reorder.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {Object.entries(groups).map(([group, items]) => (
                        <div key={group}>
                            <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-2">
                                {group}
                            </div>
                            <div className="space-y-2">
                                {items.map((w) => {
                                    const globalIndex = widgets.findIndex(
                                        (x) => x.key === w.key
                                    );
                                    const isDragging = dragIndex === globalIndex;

                                    return (
                                        <div
                                            key={w.key}
                                            draggable={!busy}
                                            onDragStart={() => handleDragStart(globalIndex)}
                                            onDragOver={(e) => handleDragOver(e, globalIndex)}
                                            onDragEnd={handleDragEnd}
                                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                                isDragging
                                                    ? 'border-emerald-500/50 bg-emerald-500/5'
                                                    : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60'
                                            }`}
                                        >
                                            <GripVertical className="h-4 w-4 text-zinc-500 cursor-grab active:cursor-grabbing mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <Label
                                                    htmlFor={`widget-${w.key}`}
                                                    className="text-sm font-medium text-zinc-200 cursor-pointer"
                                                >
                                                    {w.label}
                                                </Label>
                                                <p className="text-[11px] text-zinc-500 mt-0.5 leading-tight">
                                                    {w.description}
                                                </p>
                                            </div>
                                            <Switch
                                                id={`widget-${w.key}`}
                                                checked={w.visible}
                                                disabled={busy}
                                                onCheckedChange={() =>
                                                    toggleVisibility(w.key)
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <SheetFooter className="p-4 sm:p-6 border-t border-zinc-800 flex flex-col-reverse sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={busy}
                        className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 gap-2"
                    >
                        {resetting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        Reset
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={busy}
                        className="gap-2"
                    >
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}