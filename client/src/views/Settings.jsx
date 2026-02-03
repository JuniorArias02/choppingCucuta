import { useState, useEffect } from 'react';
import AuthService from '../services/AuthService';
import { useAuth } from '../store/AuthContext';
import Swal from 'sweetalert2';
import { User, Lock, Save, KeyRound, MapPin, Phone } from 'lucide-react';

export default function Settings() {
    const { user, login, updateUser } = useAuth(); // Assuming login or a setUser method can update context
    // Actually, AuthService updates localStorage, but Context might need a refresh. 
    // Let's assume Context reads from localStorage on mount or we force a refresh manually if needed.
    // Ideally AuthContext exposes a refreshUser method. For now, forcing a reload or using internal state.

    // Profile State
    const [profileConfig, setProfileConfig] = useState({
        nombre: user?.nombre || '',
        email: user?.email || '',
        codigo_postal: user?.perfil?.codigo_postal || '',
        direccion: user?.perfil?.direccion || '',
        departamento: user?.perfil?.departamento || '',
        ciudad: user?.perfil?.ciudad || '',
        numero_telefono: user?.perfil?.numero_telefono || '',
    });

    useEffect(() => {
        updateUser();
    }, []);

    useEffect(() => {
        if (user) {
            setProfileConfig({
                nombre: user.nombre || '',
                email: user.email || '',
                codigo_postal: user.perfil?.codigo_postal || '',
                direccion: user.perfil?.direccion || '',
                departamento: user.perfil?.departamento || '',
                ciudad: user.perfil?.ciudad || '',
                numero_telefono: user.perfil?.numero_telefono || '',
            });
        }
    }, [user]);
    // Password State
    const [passwordConfig, setPasswordConfig] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);
        try {
            const response = await AuthService.updateProfile(profileConfig);
            Swal.fire({
                title: '¡Perfil Actualizado!',
                text: 'Tus datos han sido guardados exitosamente.',
                icon: 'success',
                background: '#151E32',
                color: '#fff',
                confirmButtonColor: '#00C2CB'
            });
            await updateUser();
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo actualizar el perfil',
                icon: 'error',
                background: '#151E32',
                color: '#fff'
            });
        } finally {
            setLoadingProfile(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoadingPassword(true);
        try {
            await AuthService.changePassword(passwordConfig);
            Swal.fire({
                title: '¡Contraseña Cambiada!',
                text: 'Tu contraseña ha sido actualizada.',
                icon: 'success',
                background: '#151E32',
                color: '#fff',
                confirmButtonColor: '#00C2CB'
            });
            setPasswordConfig({ current_password: '', password: '', password_confirmation: '' });
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Verifica tu contraseña actual y que las nuevas coincidan',
                icon: 'error',
                background: '#151E32',
                color: '#fff'
            });
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Configuración de Cuenta</h1>
            <p className="text-slate-400">Gestiona tu información personal y seguridad.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Section */}
                <div className="bg-sc-navy-card rounded-2xl border border-white/5 p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                        <div className="p-2 bg-sc-cyan/10 rounded-lg text-sc-cyan">
                            <User size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Información Personal</h2>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-2">Nombre Completo</label>
                            <input
                                type="text"
                                value={profileConfig.nombre}
                                onChange={(e) => setProfileConfig({ ...profileConfig, nombre: e.target.value })}
                                className="w-full bg-sc-navy border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan transition-all outline-none"
                                placeholder="Tu nombre"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-2">Correo Electrónico</label>
                            <input
                                type="email"
                                value={profileConfig.email}
                                onChange={(e) => setProfileConfig({ ...profileConfig, email: e.target.value })}
                                className="w-full bg-sc-navy border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan transition-all outline-none"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-2">Número de Teléfono</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-3.5 text-slate-500" />
                                    <input
                                        type="tel"
                                        value={profileConfig.numero_telefono}
                                        onChange={(e) => setProfileConfig({ ...profileConfig, numero_telefono: e.target.value })}
                                        className="w-full bg-sc-navy border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan transition-all outline-none"
                                        placeholder="+57 300 123 4567"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-2">Código Postal</label>
                                <input
                                    type="text"
                                    value={profileConfig.codigo_postal}
                                    onChange={(e) => setProfileConfig({ ...profileConfig, codigo_postal: e.target.value })}
                                    className="w-full bg-sc-navy border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan transition-all outline-none"
                                    placeholder="000000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-2">Dirección de Envío</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-3.5 text-slate-500" />
                                <input
                                    type="text"
                                    value={profileConfig.direccion}
                                    onChange={(e) => setProfileConfig({ ...profileConfig, direccion: e.target.value })}
                                    className="w-full bg-sc-navy border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan transition-all outline-none"
                                    placeholder="Calle 123 # 45 - 67"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-2">Departamento</label>
                                <input
                                    type="text"
                                    value={profileConfig.departamento}
                                    onChange={(e) => setProfileConfig({ ...profileConfig, departamento: e.target.value })}
                                    className="w-full bg-sc-navy border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan transition-all outline-none"
                                    placeholder="Ej: Cundinamarca"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-2">Ciudad</label>
                                <input
                                    type="text"
                                    value={profileConfig.ciudad}
                                    onChange={(e) => setProfileConfig({ ...profileConfig, ciudad: e.target.value })}
                                    className="w-full bg-sc-navy border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-sc-cyan focus:ring-1 focus:ring-sc-cyan transition-all outline-none"
                                    placeholder="Ej: Bogotá"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loadingProfile}
                            className="w-full bg-sc-cyan hover:bg-cyan-300 text-sc-navy font-bold py-3.5 rounded-xl shadow-lg shadow-sc-cyan/20 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {loadingProfile ? (
                                <span className="animate-pulse">Guardando...</span>
                            ) : (
                                <>
                                    <Save size={20} /> Actualizar Perfil
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Password Section */}
                <div className="bg-sc-navy-card rounded-2xl border border-white/5 p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                        <div className="p-2 bg-sc-magenta/10 rounded-lg text-sc-magenta">
                            <Lock size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Seguridad</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-5">
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-2">Contraseña Actual</label>
                            <input
                                type="password"
                                value={passwordConfig.current_password}
                                onChange={(e) => setPasswordConfig({ ...passwordConfig, current_password: e.target.value })}
                                className="w-full bg-sc-navy border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-sc-magenta focus:ring-1 focus:ring-sc-magenta transition-all outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-2">Nueva Contraseña</label>
                            <input
                                type="password"
                                value={passwordConfig.password}
                                onChange={(e) => setPasswordConfig({ ...passwordConfig, password: e.target.value })}
                                className="w-full bg-sc-navy border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-sc-magenta focus:ring-1 focus:ring-sc-magenta transition-all outline-none"
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-2">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                value={passwordConfig.password_confirmation}
                                onChange={(e) => setPasswordConfig({ ...passwordConfig, password_confirmation: e.target.value })}
                                className="w-full bg-sc-navy border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-sc-magenta focus:ring-1 focus:ring-sc-magenta transition-all outline-none"
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loadingPassword}
                            className="w-full bg-sc-magenta hover:bg-pink-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sc-magenta/20 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {loadingPassword ? (
                                <span className="animate-pulse">Procesando...</span>
                            ) : (
                                <>
                                    <KeyRound size={20} /> Cambiar Contraseña
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
