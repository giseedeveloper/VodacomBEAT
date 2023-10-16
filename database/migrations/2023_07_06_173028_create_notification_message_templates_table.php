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
        Schema::create('notification_message_templates', function (Blueprint $table) {
            $table->id();
            $table->string('code')->default("FIRST_LOGIN")->nullable();
            $table->string('type')->default("")->nullable();
            $table->string('content')->default("")->nullable();
            $table->string('last_updated_by')->default("admin")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_message_templates');
    }
};
