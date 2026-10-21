<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('accounts', function (Blueprint $table) {
        $table->string('color', 7)->default('#3b82f6')->after('currency');
    });
}

public function down(): void
{
    Schema::table('accounts', function (Blueprint $table) {
        $table->dropColumn('color');
    });
}
};
