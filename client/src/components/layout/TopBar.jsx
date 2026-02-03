import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

export default function TopBar({ onMenuClick }) {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-30 h-20 px-6 md:px-10 flex items-center justify-between
            bg-sc-navy/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">

            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden transition-colors"
                >
                    <Menu size={24} />
                </button>

                {/* Search Bar - Placeholder for future implementation */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full bg-sc-navy-card/80 border border-slate-700/50 hover:border-sc-cyan/30 hover:bg-sc-navy-card transition-all group w-64 lg:w-96 focus-within:w-[26rem] focus-within:border-sc-cyan/50 focus-within:ring-2 focus-within:ring-sc-cyan/20">
                    <Search size={18} className="text-slate-500 group-hover:text-sc-cyan transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-sc-magenta rounded-full ring-2 ring-sc-navy animate-pulse"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-700/50">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-semibold text-white leading-tight">{user?.nombre}</p>
                        <p className="text-xs text-sc-cyan font-medium capitalize mt-0.5">
                            {user?.rol_id === 1 ? 'Administrador' : 'Vendedor'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer group p-1 rounded-full hover:bg-white/5 transition-all">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sc-magenta to-sc-purple p-[2px]">
                            <div className="w-full h-full rounded-full bg-sc-navy flex items-center justify-center overflow-hidden">
                                {user?.foto ? (
                                    <img src={user.foto} alt={user.nombre} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-md font-bold text-white tracking-widest">
                                        {user?.nombre?.charAt(0)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronDown size={16} className="text-slate-500 group-hover:text-white transition-colors md:block hidden" />
                    </div>
                </div>
            </div>
        </header>
    );
}
