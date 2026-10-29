<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Expand the ENUM to include 'savings'
        DB::statement("
            ALTER TABLE `transactions`
            MODIFY COLUMN `type` ENUM('income', 'expense', 'transfer', 'savings')
            NOT NULL
        ");
    }

    public function down(): void
    {
        // Revert to the original three-value enum.
        // NOTE: This will fail if any row still has type = 'savings'.
        // Reassign those rows first if you need to roll back.
        DB::statement("
            UPDATE `transactions` SET `type` = 'expense' WHERE `type` = 'savings'
        ");

        DB::statement("
            ALTER TABLE `transactions`
            MODIFY COLUMN `type` ENUM('income', 'expense', 'transfer')
            NOT NULL
        ");
    }
};