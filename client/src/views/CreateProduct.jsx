import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Upload, AlertCircle, Save, X, ArrowLeft } from 'lucide-react';
import CategoryService from '../services/CategoryService';
import ProductService from '../services/ProductService';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';

export default function CreateProduct() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Basic Info State
    const [basicInfo, setBasicInfo] = useState({
        nombre: '',
        descripcion: '',
        marca: '',
        categoria_id: '',
        descuento: '',
        precioBase: '' // Reference price
    });

    const [categories, setCategories] = useState([]);

    // Images State (Real Files)
    const [images, setImages] = useState([]); // Array of { file: File, preview: string }

    // Variants State
    const [variants, setVariants] = useState([
        { id: Date.now(), sku: '', color: '', talla: '', precio: '', stock: 0 }
    ]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await CategoryService.getAll();
                // Handle if response is the array itself or wrapped in data
                setCategories(Array.isArray(response) ? response : (response.data || []));
            } catch (error) {
                console.error("Error loading categories", error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron cargar las categorías',
                    icon: 'error',
                    background: '#151E32',
                    color: '#fff'
                });
            }
        };
        fetchCategories();
    }, []);

    // Handlers
    const handleBasicChange = (e) => {
        setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
    };

    const handleImageUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleImageSelect = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newImages = files.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const addVariant = () => {
        setVariants([...variants, { id: Date.now(), sku: '', color: '', talla: '', precio: basicInfo.precioBase, stock: 0 }]);
    };

    const removeVariant = (id) => {
        if (variants.length === 1) return;
        setVariants(variants.filter(v => v.id !== id));
    };

    const handleVariantChange = (id, field, value) => {
        setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!basicInfo.nombre || !basicInfo.categoria_id || variants.some(v => !v.precio || !v.stock)) {
            Swal.fire({
                title: 'Error',
                text: 'Por favor completa los campos obligatorios.',
                icon: 'error',
                background: '#151E32',
                color: '#fff',
                confirmButtonColor: '#D9258B'
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('nombre', basicInfo.nombre);
            formData.append('descripcion', basicInfo.descripcion);
            formData.append('marca', basicInfo.marca);
            formData.append('categoria_id', basicInfo.categoria_id);
            formData.append('descuento', basicInfo.descuento || 0);

            // Append Images
            images.forEach(img => {
                formData.append('imagenes[]', img.file);
            });

            // Append Variants (as JSON string to handle nested structure easily)
            formData.append('variantes', JSON.stringify(variants));

            await ProductService.create(formData);

            Swal.fire({
                title: '¡Producto Creado!',
                text: 'El producto se ha guardado correctamente.',
                icon: 'success',
                background: '#151E32',
                color: '#fff',
                confirmButtonColor: '#00C2CB'
            }).then(() => {
                navigate('/admin/products');
            });

        } catch (error) {
            console.error("Error creating product", error);
            Swal.fire({
                title: 'Error',
                text: 'Hubo un error al crear el producto.',
                icon: 'error',
                background: '#151E32',
                color: '#fff'
            });
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/products" className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white leading-tight">Crear Nuevo Producto</h1>
                    <p className="text-slate-400 text-sm">Añade un nuevo ítem a tu catálogo.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. Basic Info */}
                <div className="bg-sc-navy-card/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">Información Básica</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del Producto</label>
                            <input
                                type="text"
                                name="nombre"
                                value={basicInfo.nombre}
                                onChange={handleBasicChange}
                                className="w-full bg-sc-navy border border-slate-700 rounded-xl p-3.5 outline-none focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan text-white placeholder-slate-500 transition-all shadow-inner"
                                placeholder="Ej: Zapatillas Nike Air Max"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Marca</label>
                            <input
                                type="text"
                                name="marca"
                                value={basicInfo.marca}
                                onChange={handleBasicChange}
                                className="w-full bg-sc-navy border border-slate-700 rounded-xl p-3.5 outline-none focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan text-white placeholder-slate-500 transition-all shadow-inner"
                                placeholder="Ej: Nike"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
                            <div className="relative">
                                <select
                                    name="categoria_id"
                                    value={basicInfo.categoria_id}
                                    onChange={handleBasicChange}
                                    className="w-full bg-sc-navy border border-slate-700 rounded-xl p-3.5 outline-none focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan text-white appearance-none cursor-pointer shadow-inner"
                                >
                                    <option value="" className="bg-sc-navy">Selecciona una categoría</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id} className="bg-sc-navy">{cat.nombre}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
                            <textarea
                                name="descripcion"
                                rows="3"
                                value={basicInfo.descripcion}
                                onChange={handleBasicChange}
                                className="w-full bg-sc-navy border border-slate-700 rounded-xl p-3.5 outline-none focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan text-white placeholder-slate-500 transition-all shadow-inner resize-none"
                                placeholder="Detalles principales del producto..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Descuento (%)</label>
                            <input
                                type="number"
                                name="descuento"
                                min="0"
                                max="100"
                                value={basicInfo.descuento}
                                onChange={handleBasicChange}
                                className="w-full bg-sc-navy border border-slate-700 rounded-xl p-3.5 outline-none focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan text-white placeholder-slate-500 transition-all shadow-inner"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Images */}
                <div className="bg-sc-navy-card/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">Imágenes</h2>
                    <div className="flex gap-4 flex-wrap">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            multiple
                            accept="image/*"
                            className="hidden"
                        />
                        {images.map((img, idx) => (
                            <div key={idx} className="w-32 h-32 relative rounded-xl overflow-hidden border border-slate-700 group shadow-lg">
                                <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleImageUploadClick}
                            className="w-32 h-32 border-2 border-dashed border-slate-700 hover:border-sc-cyan rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-sc-cyan transition-all cursor-pointer hover:bg-white/5"
                        >
                            <Upload size={24} />
                            <span className="text-xs mt-2 font-medium">Subir Foto</span>
                        </button>
                    </div>
                </div>

                {/* 3. Variants */}
                <div className="bg-sc-navy-card/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl">
                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                        <h2 className="text-xl font-bold text-white">Variantes y Precios</h2>
                        <button type="button" onClick={addVariant} className="text-sm text-sc-cyan font-bold flex items-center gap-1.5 hover:bg-sc-cyan/10 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-sc-cyan/30">
                            <Plus size={16} /> Añadir Variante
                        </button>
                    </div>

                    <div className="space-y-3">
                        {variants.map((variant, index) => (
                            <div key={variant.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-sc-navy rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                                <div className="col-span-6 md:col-span-3">
                                    <label className="text-xs text-slate-500 font-bold block mb-1.5">SKU</label>
                                    <input
                                        type="text"
                                        className="w-full bg-sc-navy-card border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sc-cyan outline-none transition-colors"
                                        placeholder="CODE-001"
                                        value={variant.sku}
                                        onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <label className="text-xs text-slate-500 font-bold block mb-1.5">Color</label>
                                    <input
                                        type="text"
                                        className="w-full bg-sc-navy-card border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sc-cyan outline-none transition-colors"
                                        placeholder="Rojo"
                                        value={variant.color}
                                        onChange={(e) => handleVariantChange(variant.id, 'color', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <label className="text-xs text-slate-500 font-bold block mb-1.5">Talla</label>
                                    <input
                                        type="text"
                                        className="w-full bg-sc-navy-card border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sc-cyan outline-none transition-colors"
                                        placeholder="M / 38"
                                        value={variant.talla}
                                        onChange={(e) => handleVariantChange(variant.id, 'talla', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <label className="text-xs text-slate-500 font-bold block mb-1.5">Precio (COP)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-sc-navy-card border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sc-cyan outline-none transition-colors"
                                        placeholder="0"
                                        value={variant.precio}
                                        onChange={(e) => handleVariantChange(variant.id, 'precio', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <label className="text-xs text-slate-500 font-bold block mb-1.5">Stock</label>
                                    <input
                                        type="number"
                                        className="w-full bg-sc-navy-card border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sc-cyan outline-none transition-colors"
                                        placeholder="0"
                                        value={variant.stock}
                                        onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center pt-2 md:pt-0 pb-1">
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(variant.id)}
                                        className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                                        disabled={variants.length === 1}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 sticky bottom-6 z-40">
                    <div className="absolute inset-0 bg-sc-navy/80 backdrop-blur-sm -z-10 rounded-2xl blur-xl"></div>
                    <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-3 text-slate-400 hover:text-white transition-colors font-medium">Cancelar</button>
                    <button type="submit" className="px-8 py-3.5 bg-gradient-to-r from-sc-magenta to-purple-600 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-sc-magenta/20 hover:shadow-sc-magenta/40 hover:-translate-y-1 transition-all flex items-center gap-2">
                        <Save size={20} /> Guardar Producto
                    </button>
                </div>

            </form>
        </div>
    );
}
