<?php

namespace App\Console\Commands;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ProcessRecurringTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'spendwise:process-recurring';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto-generate transactions for due recurring schedules.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();

        $dueItems = RecurringTransaction::where('is_active', true)
            ->where('auto_create', true)
            ->whereDate('next_due_date', '<=', $today)
            ->get();

        foreach ($dueItems as $item) {
            Transaction::create([
                'user_id' => $item->user_id,
                'account_id' => $item->account_id,
                'category_id' => $item->category_id,
                'amount' => $item->amount,
                'type' => $item->type,
                'description' => $item->title . ' (Auto-recurring)',
                'transaction_date' => $today->format('Y-m-d'),
            ]);

            $nextDate = Carbon::parse($item->next_due_date);
            switch ($item->frequency) {
                case 'daily': 
                    $nextDate->addDay(); 
                    break;
                case 'weekly': 
                    $nextDate->addWeek(); 
                    break;
                case 'monthly': 
                    $nextDate->addMonth(); 
                    break;
                case 'yearly': 
                    $nextDate->addYear(); 
                    break;
            }

            $item->update([
                'last_generated_at' => $today,
                'next_due_date' => $nextDate,
            ]);
        }

        $this->info("Processed {$dueItems->count()} recurring transactions.");
    }
}