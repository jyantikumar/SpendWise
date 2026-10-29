<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_id')->constrained('budgets')->cascadeOnDelete();
            $table->unsignedTinyInteger('threshold_percentage'); // 80, 90, 100
            $table->timestamp('triggered_at')->nullable();
            $table->timestamps();

            $table->unique(['budget_id', 'threshold_percentage']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_alerts');
    }
};