import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductService from '../services/ProductService';
import Swal from 'sweetalert2';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await ProductService.getAll();
            // The API returns a paginated response, the products are in response.data
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los productos',
                background: '#151E32',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            background: '#151E32',
            color: '#fff',
            showCancelButton: true,
            confirmButtonColor: '#D9258B',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await ProductService.delete(id);
                    setProducts(products.filter(p => p.id !== id));
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'El producto ha sido eliminado.',
                        icon: 'success',
                        background: '#151E32',
                        color: '#fff',
                        confirmButtonColor: '#00C2CB'
                    });
                } catch (error) {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar el producto.',
                        icon: 'error',
                        background: '#151E32',
                        color: '#fff'
                    });
                }
            }
        });
    };

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.marca?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sc-cyan"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Mis Productos</h1>
                    <p className="text-slate-400">Gestiona tu inventario y catálogo de ventas.</p>
                </div>
                <Link
                    to="/admin/create-product"
                    className="bg-gradient-to-r from-sc-magenta to-purple-600 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-sc-magenta/25 hover:shadow-sc-magenta/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Crear Producto
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-sc-navy-card/50 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                <div className="relative max-w-md group">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o marca..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sc-navy border border-slate-700 focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan outline-none transition text-white placeholder-slate-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-sc-cyan transition-colors" size={18} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-sc-navy-card/80 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="p-5 font-semibold text-slate-300 text-sm">Producto</th>
                                <th className="p-5 font-semibold text-slate-300 text-sm">Categoría</th>
                                <th className="p-5 font-semibold text-slate-300 text-sm">Precio Base</th>
                                <th className="p-5 font-semibold text-slate-300 text-sm">Variantes</th>
                                <th className="p-5 font-semibold text-slate-300 text-sm text-center">Estado</th>
                                <th className="p-5 font-semibold text-slate-300 text-sm text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredProducts.map(product => {
                                // Calculate stock status and price range
                                const variants = product.variantes || [];
                                const totalStock = variants.reduce((sum, v) => sum + parseInt(v.stock), 0);
                                const prices = variants.map(v => parseFloat(v.precio));
                                const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                                const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                                const rawImg = product.imagenes && product.imagenes.length > 0 ? product.imagenes[0].url_imagen : null;
                                const mainImage = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`) : null;

                                return (
                                    <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-sc-navy overflow-hidden border border-white/10 group-hover:border-sc-cyan/30 transition-colors flex items-center justify-center">
                                                    {mainImage ? (
                                                        <img src={mainImage} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                    ) : (
                                                        <span className="text-xs text-slate-600">No img</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm line-clamp-1 w-48 group-hover:text-sc-cyan transition-colors" title={product.nombre}>{product.nombre}</p>
                                                    <p className="text-xs text-slate-500">{product.marca || 'Sin marca'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm text-slate-400">
                                            {product.categoria?.nombre || 'Sin categoría'}
                                        </td>
                                        <td className="p-5 text-sm font-bold text-white">
                                            {minPrice === maxPrice
                                                ? `$${minPrice.toLocaleString()}`
                                                : `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`
                                            }
                                        </td>
                                        <td className="p-5 text-sm text-slate-400">
                                            {variants.length} variantes
                                            <span className="text-xs text-sc-cyan/80 block mt-0.5 font-medium">({totalStock} unid.)</span>
                                        </td>
                                        <td className="p-5 text-center">
                                            {product.activo ? (
                                                <span className="inline-flex px-3 py-1 text-xs font-bold leading-5 rounded-full text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-3 py-1 text-xs font-bold leading-5 rounded-full text-slate-400 bg-slate-500/10 border border-slate-500/20">
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/admin/product/${product.id}`} className="p-2 text-slate-400 hover:text-sc-cyan hover:bg-sc-cyan/10 rounded-lg transition-all" title="Ver en tienda">
                                                    <Eye size={18} />
                                                </Link>
                                                <Link to={`/admin/product/edit/${product.id}`} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all" title="Editar">
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-800 mb-4 border border-white/5">
                            <Search className="text-slate-500" size={32} />
                        </div>
                        <p className="text-slate-400 text-lg">No se encontraron productos.</p>
                        <p className="text-slate-600 text-sm mt-1">Prueba con otro término o crea uno nuevo.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
