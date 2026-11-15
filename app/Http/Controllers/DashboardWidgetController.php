<?php

namespace App\Http\Controllers;

use App\Models\UserDashboardWidget;
use App\Support\DashboardWidgets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class DashboardWidgetController extends Controller
{
    /**
     * GET /dashboard/widgets
     * Return the resolved widget list + registry metadata.
     */
    public function index(Request $request)
    {
        return response()->json([
            'widgets'  => DashboardWidgets::resolveFor($request->user()),
            'registry' => DashboardWidgets::REGISTRY,
        ]);
    }

    /**
     * PUT /dashboard/widgets
     * Persist visibility + order.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'widgets'           => ['required', 'array', 'min:1'],
            'widgets.*.key'     => ['required', 'string', 'distinct', Rule::in(DashboardWidgets::keys())],
            'widgets.*.visible' => ['required', 'boolean'],
        ]);

        $user = $request->user();

        DB::transaction(function () use ($user, $validated) {
            $submitted = collect($validated['widgets'])->keyBy('key');
            $existing  = $user->dashboardWidgets()->get()->keyBy('widget_key');

            foreach ($validated['widgets'] as $order => $widget) {
                UserDashboardWidget::updateOrCreate(
                    [
                        'user_id'    => $user->id,
                        'widget_key' => $widget['key'],
                    ],
                    [
                        'is_visible' => $widget['visible'],
                        'sort_order' => $order,
                    ]
                );
            }

            // Push any existing-but-not-submitted rows to the end
            foreach ($existing as $key => $row) {
                if (! $submitted->has($key)) {
                    $row->update(['sort_order' => $row->sort_order + 1000]);
                }
            }
        });

        return response()->json([
            'widgets' => DashboardWidgets::resolveFor($user->fresh()),
            'message' => 'Dashboard layout saved.',
        ]);
    }

    /**
     * DELETE /dashboard/widgets
     * Reset to registry defaults.
     */
    public function reset(Request $request)
    {
        $request->user()->dashboardWidgets()->delete();

        return response()->json([
            'widgets' => DashboardWidgets::resolveFor($request->user()->fresh()),
            'message' => 'Dashboard layout reset to defaults.',
        ]);
    }
}