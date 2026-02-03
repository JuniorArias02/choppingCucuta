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
        // 1. Usuarios
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('rol'); // admin, vendedor, cliente
            $table->string('estado')->default('activo'); // activo, inactivo
            $table->timestamps();
        });

        // 2. Categorias
        Schema::create('categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->foreignId('parent_id')->nullable()->constrained('categorias')->nullOnDelete();
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });

        // 3. Productos (Depende de Categorias)
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('categorias')->cascadeOnDelete();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->string('marca')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // 4. Producto Imagenes (Depende de Productos)
        Schema::create('producto_imagenes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->string('url_imagen');
            $table->timestamps();
        });

        // 5. Atributos
        Schema::create('atributos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Talla, Color, etc.
            $table->timestamps();
        });

        // 6. Atributo Valores (Depende de Atributos)
        Schema::create('atributo_valores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('atributo_id')->constrained('atributos')->cascadeOnDelete();
            $table->string('valor'); // XL, Rojo, etc.
            // No timestamps needed strictly, but good practice usually. Requirements didn't specify, but I'll leave them out as per schema "box".
            // Actually schema box didn't show timestamps for atributo_valores, but it's fine.
        });

        // 7. Producto Variantes (Depende de Productos)
        Schema::create('producto_variantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->string('sku')->unique();
            $table->decimal('precio', 10, 2);
            $table->integer('stock')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // 8. Variante Atributos (Pivote entre Producto Variantes y Atributo Valores)
        Schema::create('variante_atributos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_variante_id')->constrained('producto_variantes')->cascadeOnDelete();
            $table->foreignId('atributo_valor_id')->constrained('atributo_valores')->cascadeOnDelete();
            // Unique constraint to avoid duplicate attributes for same variant?
            // $table->unique(['producto_variante_id', 'atributo_valor_id']); 
        });

        // 9. Carritos (Depende de Usuarios)
        Schema::create('carritos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->timestamps();
        });

        // 10. Carrito Items (Depende de Carritos y Variantes)
        Schema::create('carrito_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carrito_id')->constrained('carritos')->cascadeOnDelete();
            $table->foreignId('producto_variante_id')->constrained('producto_variantes')->cascadeOnDelete();
            $table->integer('cantidad');
        });

        // 11. Pedidos (Depende de Usuarios)
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->decimal('total', 10, 2);
            $table->string('estado'); // pendiente, pagado, enviado, cancelado
            $table->timestamps();
        });

        // 12. Pedido Items (Depende de Pedidos y Variantes)
        Schema::create('pedido_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->cascadeOnDelete();
            $table->foreignId('producto_variante_id')->nullable()->constrained('producto_variantes')->nullOnDelete(); // Si se borra la variante, historial queda? Mejor set null o guardar datos snapshot.
            // Para mantener integridad referencial simple por ahora cascade o null.
            // Pero en historial de pedidos idealmente se guarda snapshot.
            // El requerimiento dice Ref: pedido_items.producto_variante_id > producto_variantes.id
            // Dejaré cascade por simplicidad inicial, pero en producción real se snapshot.
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
        });

        // 13. Movimientos Stock (Depende de Variantes)
        Schema::create('movimientos_stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_variante_id')->constrained('producto_variantes')->cascadeOnDelete();
            $table->string('tipo'); // entrada, salida, ajuste
            $table->integer('cantidad');
            $table->string('motivo')->nullable();
            $table->timestamps();
        });

        // 14. Logs (Depende de Usuarios nullable)
        Schema::create('logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('accion'); // crear, actualizar, eliminar, login, compra
            $table->string('tabla')->nullable();
            $table->unsignedBigInteger('registro_id')->nullable();
            $table->string('ip')->nullable();
            $table->timestamps();
        });

        // Also need password_reset_tokens and sessions if using default auth features, but sticking to basics.
        // Re-adding password_reset_tokens just in case default auth looks for it.
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('logs');
        Schema::dropIfExists('movimientos_stock');
        Schema::dropIfExists('pedido_items');
        Schema::dropIfExists('pedidos');
        Schema::dropIfExists('carrito_items');
        Schema::dropIfExists('carritos');
        Schema::dropIfExists('variante_atributos');
        Schema::dropIfExists('producto_variantes');
        Schema::dropIfExists('atributo_valores');
        Schema::dropIfExists('atributos');
        Schema::dropIfExists('producto_imagenes');
        Schema::dropIfExists('productos');
        Schema::dropIfExists('categorias');
        Schema::dropIfExists('usuarios');
    }
};
