import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Edit, Trash2, Save, X, Plus, Upload,
    Box, Tag, DollarSign, Layers, Package
} from 'lucide-react';
import ProductService from '../services/ProductService';
import CategoryService from '../services/CategoryService';
import Swal from 'sweetalert2';

export default function ProductDetailAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const [isEditing, setIsEditing] = useState(window.location.pathname.includes('/edit'));
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial State
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        marca: '',
        categoria_id: '',
        descuento: '',
        precioBase: ''
    });
    const [images, setImages] = useState([]); // { id, url, file, preview, isNew }
    const [variants, setVariants] = useState([]); // { id, color, talla, precio, stock }

    useEffect(() => {
        fetchProductAndCategories();
    }, [id]);

    const fetchProductAndCategories = async () => {
        try {
            setLoading(true);
            const [productRes, categoriesRes] = await Promise.all([
                ProductService.getById(id),
                CategoryService.getAll()
            ]);

            const prod = productRes.data || productRes;
            setProduct(prod);
            setCategories(Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes.data || []));

            // Initialize Form Data
            setFormData({
                nombre: prod.nombre,
                descripcion: prod.descripcion || '',
                marca: prod.marca || '',
                categoria_id: prod.categoria_id,
                descuento: prod.descuento || 0,
                precioBase: prod.variantes?.[0]?.precio || 0
            });

            // Initialize Images
            const initialImages = (prod.imagenes || []).map(img => ({
                id: img.id,
                url: img.url_imagen.startsWith('http') ? img.url_imagen : `${API_URL}${img.url_imagen}`,
                isNew: false
            }));
            setImages(initialImages);

            // Initialize Variants
            setVariants(prod.variantes || []);

        } catch (error) {
            console.error("Error fetching data:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar el producto',
                background: '#151E32',
                color: '#fff'
            }).then(() => navigate('/admin/products'));
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---

    const handleBasicChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Image Handlers
    const handleImageUploadClick = () => fileInputRef.current.click();

    const handleImageSelect = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newImages = files.map(file => ({
                id: Date.now() + Math.random(), // Temp ID
                file,
                preview: URL.createObjectURL(file),
                isNew: true
            }));
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = (index) => {
        // If it's a new image, just remove from state
        // If it's an existing image, we might need to track deleted IDs if backend requires it
        // For now, simpler approach: we send current state. 
        // Note: Backend logic for updating images can be complex (sync vs add/delete). 
        // Assuming typical add new / delete by ID logic might be needed or full replace.
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Variant Handlers
    const addVariant = () => {
        setVariants([...variants, { id: 'temp_' + Date.now(), color: '', talla: '', precio: formData.precioBase, stock: 0 }]);
    };

    const removeVariant = (index) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append('_method', 'PUT'); // Trick for Laravel to handle PUT with FormData
            submitData.append('nombre', formData.nombre);
            submitData.append('descripcion', formData.descripcion);
            submitData.append('marca', formData.marca);
            submitData.append('categoria_id', formData.categoria_id);
            submitData.append('descuento', formData.descuento);

            // Images
            // Append new files
            images.filter(img => img.isNew).forEach(img => {
                submitData.append('imagenes[]', img.file);
            });
            // We might need to handle deleted images separately depending on backend.
            // If backend syncs images, we need to send IDs of kept images.
            // For now, let's assume standard Laravel append logic for new ones.

            // Variants
            submitData.append('variantes', JSON.stringify(variants));

            await ProductService.update(id, submitData);

            Swal.fire({
                title: '¡Actualizado!',
                text: 'Producto actualizado correctamente.',
                icon: 'success',
                background: '#151E32',
                color: '#fff',
                confirmButtonColor: '#00C2CB'
            });

            setIsEditing(false);
            fetchProductAndCategories(); // Refresh

        } catch (error) {
            console.error("Error updating:", error);
            Swal.fire({
                title: 'Error',
                text: 'Error al actualizar el producto.',
                icon: 'error',
                background: '#151E32',
                color: '#fff'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-sc-navy">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sc-cyan"></div>
        </div>
    );

    if (!product) return null;

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/admin/products" className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white leading-tight">
                            {isEditing ? 'Editar Producto' : product.nombre}
                        </h1>
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                            <span className="bg-sc-cyan/10 text-sc-cyan px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                {product.categoria?.nombre || 'Sin Categoría'}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span>ID: #{product.id}</span>
                        </p>
                    </div>
                </div>

                {!isEditing && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-sc-magenta hover:bg-sc-magenta/90 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-sc-magenta/20 transition-all flex items-center gap-2"
                        >
                            <Edit size={18} /> Editar
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                /* EDIT MODE FORM */
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Reuse similar layout to CreateProduct */}

                    {/* Basic Info */}
                    <div className="bg-sc-navy-card/80 backdrop-blur-md p-6 rounded-2xl border border-white/5">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Box size={20} className="text-sc-cyan" /> Información General
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="text-slate-400 text-sm font-bold mb-2 block">Nombre</label>
                                <input
                                    type="text" name="nombre" value={formData.nombre} onChange={handleBasicChange}
                                    className="w-full bg-sc-navy border border-slate-700 rounded-xl p-3 text-white focus:border-sc-cyan outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm font-bold mb-2 block">Marca</label>
                                <input
                                    type="text" name="marca" value={formData.marca} onChange={handleBasicChange}
                                    className="w-full bg-sc-navy border border-slate-700 rounded-xl p-3 text-white focus:border-sc-cyan outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm font-bold mb-2 block">Categoría</label>
                                <select
                                    name="categoria_id" value={formData.categoria_id} onChange={handleBasicChange}
                                    className="w-full bg-sc-navy border border-slate-700 rounded-xl p-3 text-white focus:border-sc-cyan outline-none"
                                >
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-slate-400 text-sm font-bold mb-2 block">Descripción</label>
                                <textarea
                                    name="descripcion" value={formData.descripcion} onChange={handleBasicChange} rows="3"
                                    className="w-full bg-sc-navy border border-slate-700 rounded-xl p-3 text-white focus:border-sc-cyan outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm font-bold mb-2 block">Descuento (%)</label>
                                <input
                                    type="number" name="descuento" value={formData.descuento} onChange={handleBasicChange}
                                    className="w-full bg-sc-navy border border-slate-700 rounded-xl p-3 text-white focus:border-sc-cyan outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images Edit */}
                    <div className="bg-sc-navy-card/80 backdrop-blur-md p-6 rounded-2xl border border-white/5">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Upload size={20} className="text-sc-cyan" /> Imágenes
                        </h2>
                        <div className="flex gap-4 flex-wrap">
                            <input type="file" ref={fileInputRef} onChange={handleImageSelect} multiple accept="image/*" className="hidden" />
                            {images.map((img, idx) => (
                                <div key={img.id || idx} className="w-32 h-32 relative rounded-xl overflow-hidden border border-slate-700 group">
                                    <img src={img.preview || img.url} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={handleImageUploadClick} className="w-32 h-32 border-2 border-dashed border-slate-700 hover:border-sc-cyan rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-white transition-colors">
                                <Plus size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Variants Edit */}
                    <div className="bg-sc-navy-card/80 backdrop-blur-md p-6 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Layers size={20} className="text-sc-cyan" /> Variantes
                            </h2>
                            <button type="button" onClick={addVariant} className="text-sc-cyan text-sm font-bold flex items-center gap-1 hover:underline">
                                <Plus size={16} /> Añadir
                            </button>
                        </div>
                        <div className="space-y-3">
                            {variants.map((variant, idx) => (
                                <div key={variant.id || idx} className="grid grid-cols-12 gap-3 items-center bg-sc-navy p-3 rounded-lg border border-slate-800">
                                    <div className="col-span-3">
                                        <input type="text" placeholder="Color" value={variant.color} onChange={(e) => handleVariantChange(idx, 'color', e.target.value)} className="w-full bg-transparent border-b border-slate-700 focus:border-sc-cyan outline-none text-white text-sm pb-1" />
                                    </div>
                                    <div className="col-span-3">
                                        <input type="text" placeholder="Talla" value={variant.talla} onChange={(e) => handleVariantChange(idx, 'talla', e.target.value)} className="w-full bg-transparent border-b border-slate-700 focus:border-sc-cyan outline-none text-white text-sm pb-1" />
                                    </div>
                                    <div className="col-span-3">
                                        <input type="number" placeholder="Precio" value={variant.precio} onChange={(e) => handleVariantChange(idx, 'precio', e.target.value)} className="w-full bg-transparent border-b border-slate-700 focus:border-sc-cyan outline-none text-white text-sm pb-1" />
                                    </div>
                                    <div className="col-span-2">
                                        <input type="number" placeholder="Stock" value={variant.stock} onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)} className="w-full bg-transparent border-b border-slate-700 focus:border-sc-cyan outline-none text-white text-sm pb-1" />
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <button type="button" onClick={() => removeVariant(idx)} className="text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 sticky bottom-6 z-40 pt-4">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 text-slate-300 font-bold hover:text-white transition-colors">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-sc-magenta to-purple-600 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-sc-magenta/20 flex items-center gap-2">
                            {isSubmitting ? 'Guardando...' : <><Save size={20} /> Guardar Cambios</>}
                        </button>
                    </div>
                </form>
            ) : (
                /* VIEW MODE */
                <div className="space-y-8">
                    {/* Top Section: Images & Key Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image Gallery */}
                        <div className="bg-sc-navy-card/50 rounded-2xl p-2 border border-white/5 overflow-hidden">
                            <div className="aspect-square rounded-xl overflow-hidden bg-sc-navy relative mb-2">
                                {images[0] ? (
                                    <img src={images[0].url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600"><Package size={48} /></div>
                                )}
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {images.slice(1, 5).map((img, i) => (
                                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-sc-navy border border-white/5">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-6">
                            <div className="bg-sc-navy-card/80 backdrop-blur-md p-6 rounded-2xl border border-white/5">
                                <h2 className="text-xl font-bold text-white mb-4">Detalles</h2>
                                <p className="text-slate-400 mb-6 leading-relaxed">
                                    {product.descripcion || 'Sin descripción'}
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-sc-navy rounded-xl border border-white/5">
                                        <p className="text-slate-500 text-xs uppercase font-bold mb-1">Marca</p>
                                        <p className="text-white font-medium">{product.marca || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-sc-navy rounded-xl border border-white/5">
                                        <p className="text-slate-500 text-xs uppercase font-bold mb-1">Descuento</p>
                                        <p className="text-white font-medium">{product.descuento}%</p>
                                    </div>
                                    <div className="p-4 bg-sc-navy rounded-xl border border-white/5">
                                        <p className="text-slate-500 text-xs uppercase font-bold mb-1">Estado</p>
                                        {product.activo ? (
                                            <span className="text-emerald-400 font-bold text-sm">Activo</span>
                                        ) : (
                                            <span className="text-slate-400 font-bold text-sm">Inactivo</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Variants Summary */}
                            <div className="bg-sc-navy-card/80 backdrop-blur-md p-6 rounded-2xl border border-white/5">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Layers size={18} className="text-sc-magenta" /> Stock y Variantes
                                </h3>
                                <div className="overflow-hidden rounded-xl border border-slate-800">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-white/5 text-slate-300">
                                            <tr>
                                                <th className="p-3 font-medium">Color</th>
                                                <th className="p-3 font-medium">Talla</th>
                                                <th className="p-3 font-medium text-right">Precio</th>
                                                <th className="p-3 font-medium text-right">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {product.variantes?.map(v => (
                                                <tr key={v.id} className="hover:bg-white/5">
                                                    <td className="p-3 text-slate-400">{v.color}</td>
                                                    <td className="p-3 text-slate-400">{v.talla}</td>
                                                    <td className="p-3 text-white font-bold text-right">${parseFloat(v.precio).toLocaleString()}</td>
                                                    <td className="p-3 text-white text-right">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${v.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                            {v.stock}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
