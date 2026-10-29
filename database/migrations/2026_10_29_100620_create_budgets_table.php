<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('categories')
                ->nullOnDelete();                 // null = overall budget
            $table->string('name')->nullable();     // optional label, e.g. "Groceries"
            $table->decimal('amount', 12, 2);
            $table->enum('period', ['monthly', 'weekly', 'custom'])->default('monthly');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('rollover')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'start_date']);
            $table->index(['user_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};