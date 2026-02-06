import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen bg-sc-navy text-slate-300 font-sans flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-300 ease-in-out">
                {/* Header */}
                <TopBar onMenuClick={() => setSidebarOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-sc-navy relative p-6 md:p-10 scroll-smooth custom-scrollbar">
                    {/* Background Ambient Glows */}
                    <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-sc-purple/20 rounded-full blur-[120px] opacity-40"></div>
                        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-sc-magenta/10 rounded-full blur-[150px] opacity-30"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
