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
        Schema::create('mobile_networks', function (Blueprint $table) {
            $table->id();
            $table->string("name");
            $table->string("prefix")->nullable();
            $table->string("selcom_code")->nullable();
            $table->string("mnc_code")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mobile_networks');
    }
};
