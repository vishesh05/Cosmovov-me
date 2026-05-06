
import React from 'react';
import { Icons } from './Icons';

export const ProfileIconButton: React.FC<{ onClick: () => void; isLoggedIn: boolean }> = ({ onClick, isLoggedIn }) => (
  <button 
    onClick={onClick}
    className="relative group focus:outline-none"
  >
    <div className={`w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center transition-all ${isLoggedIn ? 'bg-charcoal-900 text-gold-400' : 'bg-white text-stone-400 shadow-sm'}`}>
       <div className="scale-110">
         <Icons.Users />
       </div>
    </div>
    {isLoggedIn && (
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
    )}
  </button>
);

export const DashboardMenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void; danger?: boolean; disabled?: boolean; loading?: boolean }> = ({ icon, label, onClick, danger, disabled, loading }) => (
  <button 
    onClick={onClick}
    disabled={disabled || loading}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-95 mb-2 border ${danger ? 'bg-red-50/30 border-red-50 text-red-500' : 'bg-white border-stone-50 text-charcoal-800 hover:border-gold-200'} disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
  >
    <div className={`p-2 rounded-xl ${danger ? 'bg-red-50' : 'bg-stone-50'}`}>
      {icon}
    </div>
    <span className="text-sm font-medium flex-1 text-left">{label}</span>
    <div className="text-stone-300">
      {loading ? <div className="w-4 h-4 border-2 border-stone-200 border-t-red-400 rounded-full animate-spin" /> : <Icons.ChevronRight />}
    </div>
  </button>
);

export const UserDashboardDrawer: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
  return (
    <div 
      className={`absolute inset-0 bg-ivory-50 z-[150] transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="bg-noise absolute inset-0 opacity-40 pointer-events-none"></div>
      <div className="relative h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
