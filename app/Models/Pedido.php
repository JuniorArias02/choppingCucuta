<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $fillable = ['usuario_id', 'total', 'estado'];

    // Estados
    // Estados
    const ESTADO_PENDIENTE = 'Pendiente';
    const ESTADO_PREPARANDO = 'Preparando';
    const ESTADO_ENVIADO = 'Enviado';
    const ESTADO_ENTREGADO = 'Entregado';
    const ESTADO_CANCELADO = 'Cancelado';

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function items()
    {
        return $this->hasMany(PedidoItem::class);
    }
}
