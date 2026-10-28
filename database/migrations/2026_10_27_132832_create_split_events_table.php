<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Split Events (e.g., "Weekend Trip", "Grocery Run")
        Schema::create('split_events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('event_date');
            $table->string('status')->default('open'); // open, settled
            $table->timestamps();
        });

        // 2. Expenses logged under an event (Who paid the original bill)
        Schema::create('split_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('split_event_id')->constrained('split_events')->onDelete('cascade');
            $table->string('paid_by'); // Friend's name or "You"
            $table->decimal('amount', 10, 2);
            $table->string('description'); // e.g., "Dinner at seaside", "Gas"
            $table->timestamps();
        });

        // 3. Individual shares per expense (Who the expense was split among)
        Schema::create('split_expense_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('split_expense_id')->constrained('split_expenses')->onDelete('cascade');
            $table->string('participant_name'); // Friend's name or "You"
            $table->decimal('share_amount', 10, 2);
            $table->boolean('is_paid')->default(false);
            $table->timestamps();
        });

        // 4. Manual payback / settlement logs when someone pays someone back
        Schema::create('split_settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('split_event_id')->constrained('split_events')->onDelete('cascade');
            $table->string('payer_name'); // Who handed over the cash/GCash
            $table->string('payee_name'); // Who received it
            $table->decimal('amount', 10, 2);
            $table->date('paid_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('split_settlements');
        Schema::dropIfExists('split_expense_shares');
        Schema::dropIfExists('split_expenses');
        Schema::dropIfExists('split_events');
    }
};