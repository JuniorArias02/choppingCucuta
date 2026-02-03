<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Carrito;
use App\Models\CarritoItem;
use App\Models\ProductoVariante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Get user's orders.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Pedido::where('usuario_id', $user->id)
            ->with(['items.variante.producto.imagenes'])
            ->orderBy('created_at', 'desc');

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        $orders = $query->paginate(10);

        // Format for frontend
        $orders->getCollection()->transform(function ($order) {
            return [
                'id' => $order->id,
                'fecha' => $order->created_at->format('Y-m-d'),
                'total' => $order->total,
                'estado' => $order->estado,
                'items_count' => $order->items->sum('cantidad'),
                'preview_images' => $order->items->take(3)->map(function ($item) {
                    $img = $item->variante->producto->imagenes->first();
                    return $img ? ($img->url_imagen ?? $img) : null;
                }),
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'producto' => $item->variante->producto->nombre,
                        'cantidad' => $item->cantidad,
                        'precio' => $item->precio_unitario,
                        'sku' => $item->variante->sku,
                        'imagen' => $item->variante->producto->imagenes->first()->url_imagen ?? null
                    ];
                })
            ];
        });

        return response()->json($orders);
    }

    /**
     * Create order from cart (Checkout).
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // 1. Get Cart
        $cart = Carrito::where('usuario_id', $user->id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Carrito vacío'], 400);
        }

        $cartItems = CarritoItem::where('carrito_id', $cart->id)
            ->with('variante.producto')
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Carrito vacío'], 400);
        }

        // 2. Validate Stock & Calculate Total
        $total = 0;
        foreach ($cartItems as $item) {
            if ($item->cantidad > $item->variante->stock) {
                return response()->json([
                    'message' => "Stock insuficiente para: " . $item->variante->producto->nombre
                ], 400);
            }
            // Logic to calculate price with discount
            $discount = $item->variante->producto->descuento ?? 0;
            $price = $item->variante->precio * (1 - ($discount / 100));
            $total += $price * $item->cantidad;
        }

        DB::beginTransaction();
        try {
            // 3. Create Order
            $pedido = Pedido::create([
                'usuario_id' => $user->id,
                'total' => $total,
                'estado' => Pedido::ESTADO_PENDIENTE, // Default status from Model
                // Add fields if needed: direccion, metodo_pago, etc.
            ]);

            // 4. Create Items & Deduct Stock
            foreach ($cartItems as $item) {
                $discount = $item->variante->producto->descuento ?? 0;
                $price = $item->variante->precio * (1 - ($discount / 100));

                PedidoItem::create([
                    'pedido_id' => $pedido->id,
                    'producto_variante_id' => $item->producto_variante_id,
                    'cantidad' => $item->cantidad,
                    'precio_unitario' => $price,
                ]);

                // Deduct Stock
                $item->variante->decrement('stock', $item->cantidad);
            }

            // 5. Clear Cart
            CarritoItem::where('carrito_id', $cart->id)->delete();

            DB::commit();
            return response()->json(['message' => 'Pedido creado exitosamente', 'order' => $pedido], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al procesar el pedido: ' . $e->getMessage()], 500);
        }
    }
}
