'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, ShoppingCart, Truck, History, MessageCircle, Settings,
  LogOut, Menu, X, ChevronRight, Droplets, Package, Users, BarChart3,
  Search, Bell
} from 'lucide-react';

const buyerNavItems = [
  { href: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/buyer/tracking', label: 'Pelacakan Pesanan', icon: Truck },
  { href: '/buyer/history', label: 'Riwayat Transaksi', icon: History },
  { href: '/buyer/chat', label: 'Chat', icon: MessageCircle },
  { href: '/buyer/settings', label: 'Pengaturan Akun', icon: Settings },
];

const sellerNavItems = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/orders', label: 'Pemrosesan Pesanan', icon: Package },
  { href: '/seller/fleet', label: 'Manajemen Armada', icon: Truck },
  { href: '/seller/tracking', label: 'Pelacakan Pengiriman', icon: BarChart3 },
  { href: '/seller/chat', label: 'Chat', icon: MessageCircle },
  { href: '/seller/settings', label: 'Pengaturan Akun', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = user?.role === 'VENDOR' ? sellerNavItems : buyerNavItems;

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Vendor-Hub</h1>
            <p className="text-xs text-slate-400">{user?.role === 'VENDOR' ? 'Seller Portal' : 'Buyer Portal'}</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-3">
            {user?.role === 'VENDOR' ? 'Seller Portal' : 'Menu Utama'}
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-item ${active ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-4 h-4 text-primary-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Profile & Logout */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="sidebar-item w-full text-red-500 hover:bg-red-50 hover:text-red-600 mt-1"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            {/* Search Box on Header */}
            <div className="hidden md:flex items-center bg-[#F4F6F9] px-3.5 py-2 rounded-xl w-80 border border-slate-150">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Cari pesanan, vendor, atau dokumen..." 
                className="bg-transparent border-none text-xs text-slate-700 outline-none w-full placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            {/* Settings Button */}
            <Link href={user?.role === 'VENDOR' ? '/seller/settings' : '/buyer/settings'} className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
              <Settings className="w-4 h-4" />
            </Link>

            {/* Profile Avatar & Name */}
            <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-slate-700 truncate max-w-[120px]">
                {user?.name || 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
