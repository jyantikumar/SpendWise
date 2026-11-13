import { useState, useRef } from 'react';

export default function NetFlowSparkline({ data = [], formatCurrency }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const svgRef = useRef(null);

    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-xs text-zinc-500">
                No trend data for this period.
            </div>
        );
    }

    const values = data.map((d) => d.net);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 0);
    const range = max - min || 1;

    const width = 800;
    const height = 120;
    const padX = 8;
    const padY = 12;

    const points = data.map((d, i) => {
        const x = (i / Math.max(1, data.length - 1)) * (width - padX * 2) + padX;
        const y = height - padY - ((d.net - min) / range) * (height - padY * 2);
        return { ...d, x, y, index: i };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

    const zeroY = height - padY - ((0 - min) / range) * (height - padY * 2);

    const lastValue = values[values.length - 1] || 0;
    const isPositive = lastValue >= 0;
    const stroke = isPositive ? '#10b981' : '#f43f5e';

    const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

    // Map mouse X → nearest point index
    const handleMouseMove = (e) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, relX / rect.width));
        const idx = Math.round(ratio * (data.length - 1));
        setHoveredIndex(idx);
    };

    const handleMouseLeave = () => setHoveredIndex(null);

    // Tooltip horizontal position (clamped so it never overflows the card)
    const tooltipLeftPct = activePoint ? (activePoint.x / width) * 100 : 0;
    const tooltipAnchor = tooltipLeftPct < 15
        ? 'left'
        : tooltipLeftPct > 85
        ? 'right'
        : 'center';

    return (
        <div className="relative w-full h-full">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                className="w-full h-full cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <defs>
                    <linearGradient id="netFlowFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stroke} stopOpacity="0.30" />
                        <stop offset="100%" stopColor={stroke} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Zero baseline */}
                <line
                    x1={padX}
                    y1={zeroY}
                    x2={width - padX}
                    y2={zeroY}
                    stroke="#3f3f46"
                    strokeDasharray="3 4"
                    strokeWidth="0.75"
                    vectorEffect="non-scaling-stroke"
                />

                {/* Area + line */}
                <path d={areaPath} fill="url(#netFlowFill)" />
                <path
                    d={linePath}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                />

                {/* Crosshair + active marker */}
                {activePoint && (
                    <>
                        <line
                            x1={activePoint.x}
                            y1={padY}
                            x2={activePoint.x}
                            y2={height - padY}
                            stroke="#52525b"
                            strokeDasharray="2 3"
                            strokeWidth="0.75"
                            vectorEffect="non-scaling-stroke"
                        />
                        <circle
                            cx={activePoint.x}
                            cy={activePoint.y}
                            r="6"
                            fill={stroke}
                            opacity="0.18"
                            vectorEffect="non-scaling-stroke"
                        />
                        <circle
                            cx={activePoint.x}
                            cy={activePoint.y}
                            r="3"
                            fill={stroke}
                            vectorEffect="non-scaling-stroke"
                        />
                    </>
                )}

                {/* Default end marker when not hovering */}
                {!activePoint && (
                    <circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r="2.5"
                        fill={stroke}
                        vectorEffect="non-scaling-stroke"
                    />
                )}
            </svg>

            {/* Rich tooltip */}
            {activePoint && (
                <div
                    className="absolute z-10 pointer-events-none transition-opacity duration-100"
                    style={{
                        left:
                            tooltipAnchor === 'left'
                                ? `${tooltipLeftPct}%`
                                : tooltipAnchor === 'right'
                                ? `${tooltipLeftPct}%`
                                : `${tooltipLeftPct}%`,
                        top: `${Math.max(0, (activePoint.y / height) * 100 - 6)}%`,
                        transform:
                            tooltipAnchor === 'left'
                                ? 'translate(-8px, -100%)'
                                : tooltipAnchor === 'right'
                                ? 'translate(calc(-100% + 8px), -100%)'
                                : 'translate(-50%, -100%)',
                    }}
                >
                    <div className="rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl px-3 py-2 min-w-[150px]">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">
                            {activePoint.rawDate
                                ? new Date(activePoint.rawDate + 'T00:00:00').toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                  })
                                : activePoint.date}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4 text-[11px]">
                                <span className="flex items-center gap-1.5 text-zinc-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Income
                                </span>
                                <span className="font-semibold text-emerald-400 whitespace-nowrap">
                                    {formatCurrency(activePoint.income ?? 0)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4 text-[11px]">
                                <span className="flex items-center gap-1.5 text-zinc-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                    Expense
                                </span>
                                <span className="font-semibold text-rose-400 whitespace-nowrap">
                                    {formatCurrency(activePoint.expense ?? 0)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4 text-[11px] pt-1.5 mt-1 border-t border-zinc-800">
                                <span className="text-zinc-400 font-medium">Net</span>
                                <span
                                    className={`font-bold whitespace-nowrap ${
                                        activePoint.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                                >
                                    {activePoint.net >= 0 ? '+' : ''}
                                    {formatCurrency(activePoint.net)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}