<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Wishlist Items (The main product you want)
        Schema::create('wishlist_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('target_price', 10, 2)->nullable(); // Optional goal budget
            $table->string('priority')->default('medium'); // low, medium, high
            $table->string('status')->default('active'); // active, purchased, archived
            $table->timestamps();
        });

        // 2. Price Comparison Links (Sites like Shopee, Lazada, etc.)
        Schema::create('wishlist_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wishlist_item_id')->constrained('wishlist_items')->onDelete('cascade');
            $table->string('site_name'); // e.g., Shopee, Lazada, Amazon
            $table->decimal('price', 10, 2);
            $table->string('product_url'); // Direct link to product
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wishlist_prices');
        Schema::dropIfExists('wishlist_items');
    }
};