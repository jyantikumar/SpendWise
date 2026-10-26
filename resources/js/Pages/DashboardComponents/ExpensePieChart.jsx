import { useState } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';

export default function ExpensePieChart({ data = [], formatCurrency, onCategoryClick }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const total = data.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

    if (total === 0 || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground min-h-[300px]">
                <PieChartIcon className="h-10 w-10 stroke-1 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-zinc-400">No expense records for this period.</p>
            </div>
        );
    }

    let cumulativeAngle = 0;
    const slices = data.map((item, index) => {
        const value = parseFloat(item.total) || 0;
        const percentage = (value / total) * 100;
        const angle = (value / total) * 360;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + angle;
        cumulativeAngle += angle;

        const cx = 100, cy = 100, rOut = 80, rIn = 52;
        const radStart = ((startAngle - 90) * Math.PI) / 180;
        const radEnd = ((endAngle - 90) * Math.PI) / 180;

        const x1Out = cx + rOut * Math.cos(radStart);
        const y1Out = cy + rOut * Math.sin(radStart);
        const x2Out = cx + rOut * Math.cos(radEnd);
        const y2Out = cy + rOut * Math.sin(radEnd);

        const x1In = cx + rIn * Math.cos(radStart);
        const y1In = cy + rIn * Math.sin(radStart);
        const x2In = cx + rIn * Math.cos(radEnd);
        const y2In = cy + rIn * Math.sin(radEnd);

        const largeArc = angle >= 360 ? 1 : angle > 180 ? 1 : 0;

        let pathData = '';
        if (angle >= 359.99) {
            pathData = `M ${cx} ${cy - rOut} A ${rOut} ${rOut} 0 1 1 ${cx - 0.01} ${cy - rOut} L ${cx - 0.01} ${cy - rIn} A ${rIn} ${rIn} 0 1 0 ${cx} ${cy - rIn} Z`;
        } else {
            pathData = `M ${x1Out} ${y1Out} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2Out} ${y2Out} L ${x2In} ${y2In} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x1In} ${y1In} Z`;
        }

        return {
            ...item,
            value,
            percentage,
            pathData,
            color: item.color || '#3b82f6',
        };
    });

    const activeItem = hoveredIndex !== null ? slices[hoveredIndex] : null;

    return (
        <div className="flex flex-col items-center gap-4 h-full min-h-0 flex-1">
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center my-1">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    {slices.map((slice, index) => (
                        <path
                            key={slice.id || index}
                            d={slice.pathData}
                            fill={slice.color}
                            className="transition-all duration-200 cursor-pointer hover:opacity-90"
                            style={{
                                transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                                transformOrigin: '100px 100px',
                            }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => onCategoryClick && onCategoryClick(slice)}
                        />
                    ))}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider truncate max-w-[90px]">
                        {activeItem ? activeItem.name : 'Total'}
                    </span>
                    <span className="text-sm font-bold tracking-tight text-zinc-300">
                        {activeItem ? formatCurrency(activeItem.value) : formatCurrency(total)}
                    </span>
                    {activeItem && (
                        <span className="text-[10px] text-zinc-400 font-medium">
                            {activeItem.percentage.toFixed(1)}%
                        </span>
                    )}
                </div>
            </div>

            <div className="w-full space-y-1.5 overflow-y-auto max-h-[220px] sm:max-h-[300px] pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {slices.map((slice, index) => (
                    <div
                        key={slice.id || index}
                        className={`flex items-center justify-between p-2 rounded-md transition-colors cursor-pointer text-xs ${
                            hoveredIndex === index ? 'bg-zinc-800 font-medium text-zinc-100' : 'hover:bg-zinc-800/50 text-zinc-300'
                        }`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => onCategoryClick && onCategoryClick(slice)}
                    >
                        <div className="flex items-center gap-2 truncate pr-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: slice.color }}
                            />
                            <span className="truncate">{slice.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-zinc-400 text-[11px] font-mono">
                                {slice.percentage.toFixed(0)}%
                            </span>
                            <span className="font-semibold">{formatCurrency(slice.value)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}