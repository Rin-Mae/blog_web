<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Transitional change: include old value 'inactive' so existing rows don't error.
        DB::statement("ALTER TABLE users MODIFY status ENUM('active','inactive','deactivated','banned') NOT NULL DEFAULT 'active'");
        // Migrate data: convert 'inactive' rows to 'deactivated'.
        DB::table('users')->where('status', 'inactive')->update(['status' => 'deactivated']);
        // Final enum without 'inactive'.
        DB::statement("ALTER TABLE users MODIFY status ENUM('active','deactivated','banned') NOT NULL DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back allowing 'inactive'.
        DB::statement("ALTER TABLE users MODIFY status ENUM('active','inactive','banned') NOT NULL DEFAULT 'active'");
    }
};
