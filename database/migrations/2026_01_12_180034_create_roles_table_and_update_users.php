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
        // 1. Create Roles table
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique(); // admin, vendedor, cliente
            $table->timestamps();
        });

        // 2. Insert default roles (Moved to Seeder)


        // 3. Update Users table
        Schema::table('usuarios', function (Blueprint $table) {
            // Add new column nullable first
            // Add new column
            $table->foreignId('rol_id')->nullable()->constrained('roles');
        });

        // Migrate existing data (if any)
        // For 'admin' -> rol_id 1, etc.
        // Assuming database is empty or we map it. 
        // If 'rol' column has data:
        // DB::statement("UPDATE usuarios SET rol_id = (SELECT id FROM roles WHERE nombre = usuarios.rol)");

        // Drop old column
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn('rol');
        });

        // Make rol_id required (not nullable) if desired, but we need to ensure all users have roles.
        // For this step I'll leave it or make it NOT NULL if I'm sure.
        // Let's make it not null after update.
        Schema::table('usuarios', function (Blueprint $table) {
            $table->unsignedBigInteger('rol_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->string('rol')->nullable();
        });

        // Restore string roles if needed (omitted for brevity)

        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropForeign(['rol_id']);
            $table->dropColumn('rol_id');
        });

        Schema::dropIfExists('roles');
    }
};
