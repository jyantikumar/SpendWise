<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recurring_transactions', function (Blueprint $table) {
            // Add new JSON column for multiple weekdays
            $table->json('weekdays')->nullable()->after('frequency');
        });

        // Drop the old single-weekday column if it still exists
        if (Schema::hasColumn('recurring_transactions', 'weekday')) {
            Schema::table('recurring_transactions', function (Blueprint $table) {
                $table->dropColumn('weekday');
            });
        }
    }

    public function down(): void
    {
        Schema::table('recurring_transactions', function (Blueprint $table) {
            $table->dropColumn('weekdays');
        });

        if (!Schema::hasColumn('recurring_transactions', 'weekday')) {
            Schema::table('recurring_transactions', function (Blueprint $table) {
                $table->unsignedTinyInteger('weekday')
                    ->nullable()
                    ->after('frequency')
                    ->comment('0=Sun..6=Sat; only used when frequency = weekly');
            });
        }
    }
};