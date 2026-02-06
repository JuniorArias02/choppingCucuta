<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\Pedido;
use App\Models\MovimientoStock;
use App\Models\ReservaStock;
use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * Confirmar pago (llamado por webhook de pasarela o manualmente)
     */
    public function confirm(Request $request, $pagoId)
    {
        $pago = Pago::findOrFail($pagoId);

        // Validar que el pago esté pendiente
        if ($pago->estado !== Pago::ESTADO_PENDIENTE) {
            return response()->json(['message' => 'El pago ya fue procesado'], 400);
        }

        DB::beginTransaction();
        try {
            // 1. Verificar pago con la pasarela (por ahora simulado)
            $pagoVerificado = $this->verificarPagoConPasarela($pago, $request);

            if (!$pagoVerificado['exitoso']) {
                // Marcar pago como fallido
                $pago->update([
                    'estado' => Pago::ESTADO_FALLIDO,
                    'pasarela_respuesta' => json_encode($pagoVerificado['respuesta']),
                ]);

                DB::commit();
                return response()->json(['message' => 'Pago fallido'], 400);
            }

            // 2. Actualizar pago a completado
            $pago->update([
                'estado' => Pago::ESTADO_COMPLETADO,
                'fecha_pago' => now(),
                'pasarela_transaccion_id' => $pagoVerificado['transaccion_id'] ?? null,
                'pasarela_nombre' => $pagoVerificado['pasarela'] ?? $pago->metodo_pago,
                'pasarela_respuesta' => json_encode($pagoVerificado['respuesta'] ?? []),
            ]);

            // 3. Actualizar pedido a PAGADO
            $pedido = $pago->pedido;
            $pedido->update([
                'estado' => Pedido::ESTADO_PAGADO,
                'pagado_en' => now(),
            ]);

            // 4. DESCONTAR STOCK (SOLO AQUÍ, NO ANTES)
            foreach ($pedido->items as $item) {
                $variante = $item->variante;

                // Verificar stock nuevamente (por seguridad)
                if ($variante->stock < $item->cantidad) {
                    // Caso crítico: stock insuficiente después de pago
                    throw new \Exception("Stock insuficiente para {$variante->sku}. Contactar al administrador.");
                }

                // Descontar stock
                $variante->decrement('stock', $item->cantidad);

                // Registrar movimiento de stock
                MovimientoStock::create([
                    'producto_variante_id' => $variante->id,
                    'tipo' => MovimientoStock::TIPO_SALIDA,
                    'cantidad' => -$item->cantidad,
                    'motivo' => "Venta - Pedido #{$pedido->id}",
                ]);
            }

            // 5. Eliminar reservas de stock (ya no son necesarias)
            ReservaStock::where('pedido_id', $pedido->id)->delete();

            // 6. Registrar en logs
            Log::create([
                'usuario_id' => $pedido->usuario_id,
                'accion' => 'compra',
                'tabla' => 'pedidos',
                'registro_id' => $pedido->id,
                'ip' => $request->ip(),
            ]);

            DB::commit();

            // 7. Aquí se podría enviar email de confirmación
            // Mail::to($pedido->usuario->email)->send(new PedidoConfirmado($pedido));

            return response()->json([
                'message' => 'Pago confirmado exitosamente',
                'pedido' => $pedido->fresh()->load('items'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            // Log del error
            \Log::error('Error confirmando pago', [
                'pago_id' => $pago->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error al confirmar el pago',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar pago con pasarela (stub - implementar según pasarela)
     */
    private function verificarPagoConPasarela(Pago $pago, Request $request)
    {
        // Por ahora, retornar éxito automáticamente
        // En producción, aquí iría la lógica de verificación con Stripe/Wompi

        // Ejemplo para efectivo: aprobar manualmente
        if ($pago->metodo_pago === 'efectivo' || $pago->metodo_pago === 'transferencia') {
            // Requiere aprobación manual del admin
            // Por ahora lo aprobamos automáticamente para testing
            return [
                'exitoso' => true,
                'transaccion_id' => 'MANUAL_' . uniqid(),
                'pasarela' => $pago->metodo_pago,
                'respuesta' => ['status' => 'approved', 'method' => 'manual'],
            ];
        }

        // Para Stripe/Wompi: verificar con la API de la pasarela
        return [
            'exitoso' => true,
            'transaccion_id' => 'TEST_' . uniqid(),
            'pasarela' => $pago->metodo_pago,
            'respuesta' => ['status' => 'approved'],
        ];
    }
}
