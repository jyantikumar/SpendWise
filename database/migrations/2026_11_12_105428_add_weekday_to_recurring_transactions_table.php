<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recurring_transactions', function (Blueprint $table) {
            // 0 = Sunday, 1 = Monday, ... 6 = Saturday (matches Carbon::dayOfWeek)
            $table->unsignedTinyInteger('weekday')
                ->nullable()
                ->after('frequency')
                ->comment('0=Sun..6=Sat; only used when frequency = weekly');
        });
    }

    public function down(): void
    {
        Schema::table('recurring_transactions', function (Blueprint $table) {
            $table->dropColumn('weekday');
        });
    }
};