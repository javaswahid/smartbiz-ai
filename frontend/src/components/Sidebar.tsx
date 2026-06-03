'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import api from '../lib/api';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const activeUser = api.getUser();
    if (!activeUser) {
      router.push('/login');
    } else {
      setUser(activeUser);
    }
  }, [router]);

  const handleLogout = () => {
    api.clearToken();
    router.push('/login');
  };

  if (!user) return null;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['OWNER', 'ADMIN', 'STAFF'] },
    { name: 'Produk & Inventori', path: '/products', icon: '📦', roles: ['OWNER', 'ADMIN', 'STAFF'] },
    { name: 'Pelanggan CRM', path: '/customers', icon: '👥', roles: ['OWNER', 'ADMIN', 'STAFF'] },
    { name: 'Laporan Keuangan', path: '/finance', icon: '💸', roles: ['OWNER', 'ADMIN'] },
    { name: 'AI Chat Assistant', path: '/ai-assistant', icon: '💬', roles: ['OWNER', 'ADMIN'] },
    { name: 'AI Prediksi & Marketing', path: '/predictions', icon: '🔮', roles: ['OWNER', 'ADMIN'] },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 font-sans">
      <div className="flex flex-col gap-6 p-6 overflow-y-auto">
        {/* Brand Banner */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-extrabold text-white text-sm">
            S
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-sm text-white">SmartBiz AI</span>
            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">{user.businessName || 'Usaha UMKM'}</span>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400 text-xs shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-left truncate">
            <span className="text-xs font-bold text-white truncate">{user.name}</span>
            <span className="text-[9px] font-extrabold tracking-wider text-blue-500 uppercase">{user.role}</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {menuItems
            .filter(item => item.roles.includes(user.role))
            .map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="p-6 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-950/40 hover:bg-red-950/20 text-xs font-bold text-slate-400 hover:text-red-400 border border-slate-800 rounded-lg transition-colors"
        >
          🚪 Keluar
        </button>
      </div>
    </aside>
  );
}
