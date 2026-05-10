import React, { useState } from 'react';
import { Icons } from '../../components/Icons';
import { AppView } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
    children: React.ReactNode;
    activeView: AppView;
    onNavigate: (view: AppView) => void;
    onLogout: () => void;
}

const AdminSidebarItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    isCollapsed: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, isCollapsed, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 group relative ${isActive
            ? 'bg-stone-100 dark:bg-charcoal-800 text-gold-600 dark:text-gold-400 font-bold shadow-sm'
            : 'text-charcoal-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-charcoal-800/50 hover:text-charcoal-900 dark:hover:text-stone-200'
            } ${isCollapsed ? 'justify-center w-full' : 'w-full'}`}
    >
        <div className={`${isActive ? 'text-gold-600 dark:text-gold-400' : 'text-stone-400 dark:text-stone-500'} flex-shrink-0`}>
            {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
        </div>
        {!isCollapsed && <span className="text-sm tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300">{label}</span>}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-ivory-50 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-stone-200 dark:border-charcoal-700">
                {label}
            </div>
        )}
    </button>
);

const AdminDashboardLayout: React.FC<Props> = ({ children, activeView, onNavigate, onLogout }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="flex h-screen w-screen bg-stone-50 dark:bg-[#141413] text-charcoal-900 dark:text-ivory-50 font-sans overflow-hidden">
            {/* Sidebar */}
            <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-[#1c1b19] border-r border-stone-200 dark:border-[#33312e] flex flex-col p-4 transition-all duration-300 ease-in-out relative z-20 shadow-md h-full`}>
                <div className={`flex items-center gap-3 mb-8 px-2 mt-2 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 bg-gold-50 dark:bg-gold-500/10 rounded-xl flex items-center justify-center border border-gold-100 dark:border-gold-500/20 flex-shrink-0">
                        <Icons.Sparkles className="w-6 h-6 text-gold-600 dark:text-gold-400" />
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden whitespace-nowrap animate-fade-in flex-1">
                            <h1 className="text-lg font-serif font-bold text-charcoal-900 dark:text-ivory-50">CosmoVoc</h1>
                            <span className="text-[10px] text-gold-600 dark:text-gold-400 uppercase tracking-widest font-bold block -mt-1">Admin Panel</span>
                        </div>
                    )}
                </div>

                <div className="space-y-1 flex-1 overflow-y-auto no-scrollbar">
                    {!isCollapsed && <p className="px-4 text-[10px] font-bold text-stone-400 dark:text-charcoal-500 uppercase tracking-widest mb-2 mt-4 whitespace-nowrap">Overview</p>}
                    <AdminSidebarItem
                        icon={<Icons.Grid />}
                        label="Dashboard"
                        isActive={activeView === AppView.AdminDashboard}
                        isCollapsed={isCollapsed}
                        onClick={() => onNavigate(AppView.AdminDashboard)}
                    />
                    <AdminSidebarItem
                        icon={<Icons.Activity />}
                        label="Retention"
                        isActive={activeView === AppView.AdminRetention}
                        isCollapsed={isCollapsed}
                        onClick={() => onNavigate(AppView.AdminRetention)}
                    />
                    <AdminSidebarItem
                        icon={<Icons.AstroChat />}
                        label="AI Analytics"
                        isActive={activeView === AppView.AdminAIChat}
                        isCollapsed={isCollapsed}
                        onClick={() => onNavigate(AppView.AdminAIChat)}
                    />
                    <AdminSidebarItem
                        icon={<Icons.Chart />}
                        label="Features"
                        isActive={activeView === AppView.AdminFeatures}
                        isCollapsed={isCollapsed}
                        onClick={() => onNavigate(AppView.AdminFeatures)}
                    />
                    <AdminSidebarItem
                        icon={<Icons.Compass />}
                        label="Content"
                        isActive={activeView === AppView.AdminContent}
                        isCollapsed={isCollapsed}
                        onClick={() => onNavigate(AppView.AdminContent)}
                    />

                    {!isCollapsed && <p className="px-4 text-[10px] font-bold text-stone-400 dark:text-charcoal-500 uppercase tracking-widest mb-2 mt-6 whitespace-nowrap">Management</p>}
                    <AdminSidebarItem
                        icon={<Icons.Users />}
                        label="Users"
                        isActive={activeView === AppView.AdminUsers}
                        isCollapsed={isCollapsed}
                        onClick={() => onNavigate(AppView.AdminUsers)}
                    />

                    {!isCollapsed && <p className="px-4 text-[10px] font-bold text-stone-400 dark:text-charcoal-500 uppercase tracking-widest mb-2 mt-6 whitespace-nowrap">Finance</p>}
                    <AdminSidebarItem
                        icon={<Icons.Wallet />}
                        label="Transactions"
                        isActive={activeView === AppView.AdminFinance}
                        isCollapsed={isCollapsed}
                        onClick={() => onNavigate(AppView.AdminFinance)}
                    />

                    {!isCollapsed && <p className="px-4 text-[10px] font-bold text-stone-400 dark:text-charcoal-500 uppercase tracking-widest mb-2 mt-6 whitespace-nowrap">Support</p>}
                    <AdminSidebarItem
                        icon={<Icons.Message />}
                        label="Support"
                        isActive={activeView === AppView.AdminSupport}
                        isCollapsed={isCollapsed}
                        onClick={() => onNavigate(AppView.AdminSupport)}
                    />
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="mb-4 mx-auto p-2 rounded-full hover:bg-stone-50 dark:hover:bg-charcoal-800 text-stone-400 dark:text-stone-500 transition-colors"
                >
                    {isCollapsed ? <Icons.ChevronRight className="w-5 h-5" /> : <Icons.ChevronLeft className="w-5 h-5" />}
                </button>

                <button
                    onClick={onLogout}
                    className={`mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ${isCollapsed ? 'justify-center' : 'w-full'}`}
                >
                    <Icons.X className="w-5 h-5" />
                    {!isCollapsed && <span className="text-sm font-bold whitespace-nowrap">Logout</span>}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50 dark:bg-[#141413] relative">
                <header className="h-16 border-b border-stone-200 dark:border-[#33312e] flex items-center justify-between px-8 bg-white/80 dark:bg-[#1c1b19]/80 backdrop-blur-md z-10 flex-shrink-0">
                    <h2 className="text-lg font-bold text-charcoal-900 dark:text-ivory-50">
                        {activeView === AppView.AdminDashboard && "Dashboard Overview"}
                        {activeView === AppView.AdminRetention && "Retention Analytics"}
                        {activeView === AppView.AdminAIChat && "AI Chat Analytics"}
                        {activeView === AppView.AdminFeatures && "Feature Analytics"}
                        {activeView === AppView.AdminContent && "Content & Personalization"}
                        {activeView === AppView.AdminUsers && "User Management"}
                        {activeView === AppView.AdminFinance && "Monetization & Revenue"}
                        {activeView === AppView.AdminSupport && "Support Center"}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-full bg-stone-50 dark:bg-charcoal-800 border border-stone-200 dark:border-charcoal-700 flex items-center justify-center text-charcoal-500 dark:text-stone-400 hover:text-gold-500 transition-colors"
                        >
                            {isDark ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
                        </button>
                        <div className="w-px h-6 bg-stone-200 dark:bg-charcoal-800 mx-2"></div>
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">Admin User</div>
                            <div className="text-[10px] text-stone-400 dark:text-stone-500">Super Admin</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-charcoal-800 border border-stone-200 dark:border-charcoal-700 flex items-center justify-center text-charcoal-500 dark:text-stone-400">
                            <Icons.User className="w-5 h-5" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8 relative">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;
