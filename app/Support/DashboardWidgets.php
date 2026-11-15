<?php

namespace App\Support;

use App\Models\User;

class DashboardWidgets
{
    /**
     * key => [label, description, group, default, col_span]
     * col_span: 'full' | 1 | 2  (grid hint for the dashboard layout)
     */
    public const REGISTRY = [
        'kpis' => [
            'label'       => 'KPI Cards',
            'description' => 'Total balance, net cash flow, and income vs. expense.',
            'group'       => 'Overview',
            'default'     => true,
            'col_span'    => 'full',
        ],
        'cash_flow_trend' => [
            'label'       => 'Cash Flow Trend',
            'description' => 'Daily net cash flow sparkline.',
            'group'       => 'Overview',
            'default'     => true,
            'col_span'    => 'full',
        ],
        'recent_transactions' => [
            'label'       => 'Recent Transactions',
            'description' => 'Your latest transaction activity.',
            'group'       => 'Activity',
            'default'     => true,
            'col_span'    => 2,
        ],
        'expense_chart' => [
            'label'       => 'Expense / Accounts Chart',
            'description' => 'Category breakdown and account balance donut.',
            'group'       => 'Activity',
            'default'     => true,
            'col_span'    => 1,
        ],
        'budget_overview' => [
            'label'       => 'Budget Overview',
            'description' => 'Progress on active budgets for this period.',
            'group'       => 'Planning',
            'default'     => false,
            'col_span'    => 2,
        ],
        'savings_goals' => [
            'label'       => 'Savings Goals',
            'description' => 'Progress toward your savings targets.',
            'group'       => 'Planning',
            'default'     => false,
            'col_span'    => 1,
        ],
        'upcoming_recurring' => [
            'label'       => 'Upcoming Recurring',
            'description' => 'Recurring payments due soon.',
            'group'       => 'Planning',
            'default'     => false,
            'col_span'    => 1,
        ],
        'split_balances' => [
            'label'       => 'Split Balances',
            'description' => 'Who owes you and who you owe.',
            'group'       => 'Social',
            'default'     => false,
            'col_span'    => 1,
        ],
        'wishlist_progress' => [
            'label'       => 'Wishlist Progress',
            'description' => 'How close you are to wishlist targets.',
            'group'       => 'Planning',
            'default'     => false,
            'col_span'    => 1,
        ],
    ];

    public static function keys(): array
    {
        return array_keys(self::REGISTRY);
    }

    public static function defaults(): array
    {
        return array_keys(array_filter(
            self::REGISTRY,
            fn ($w) => $w['default'] === true
        ));
    }

    public static function meta(string $key): ?array
    {
        return self::REGISTRY[$key] ?? null;
    }

    /**
     * Merge the user's saved widget rows with the registry so every
     * registry key is present, ordered, with visibility resolved.
     */
    public static function resolveFor(User $user): array
    {
        $saved    = $user->dashboardWidgets()->get()->keyBy('widget_key');
        $defaults = self::defaults();

        $resolved = [];
        foreach (self::REGISTRY as $key => $meta) {
            $row = $saved->get($key);

            $resolved[] = [
                'key'         => $key,
                'label'       => $meta['label'],
                'description' => $meta['description'],
                'group'       => $meta['group'],
                'col_span'    => $meta['col_span'] ?? 1,
                'visible'     => $row ? (bool) $row->is_visible : in_array($key, $defaults, true),
                'sort_order'  => $row ? (int) $row->sort_order : PHP_INT_MAX,
            ];
        }

        usort($resolved, fn ($a, $b) => $a['sort_order'] <=> $b['sort_order']);

        return array_map(function ($w) {
            unset($w['sort_order']);
            return $w;
        }, $resolved);
    }
}   