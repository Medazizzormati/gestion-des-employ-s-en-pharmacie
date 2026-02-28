'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Pill,
} from 'lucide-react';

const navItems = [
  { href: '/hr-agent', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/hr-agent/planning', label: 'Planification', icon: Calendar },
  { href: '/hr-agent/absences', label: 'Absences', icon: ClipboardList },
  { href: '/hr-agent/chat', label: 'Assistant IA', icon: MessageSquare },
  { href: '/hr-agent/compliance', label: 'Conformité', icon: ShieldCheck },
];

export default function HRAgentLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/hr-agent' ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Desktop Sidebar ─────────────────────── */}
      <aside
        style={{
          width: 240,
          background: '#0d1117',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Pill size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', lineHeight: 1.2 }}>PharmAssist</div>
              <div style={{ fontSize: 11, color: '#64748b', letterSpacing: '.5px' }}>HR Agent</div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '6px 10px' }}>
            <span className="status-dot" />
            <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>API Connectée</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', letterSpacing: 1, textTransform: 'uppercase', padding: '4px 8px 8px' }}>
            Navigation
          </div>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-item ${isActive(href) ? 'active' : ''}`} style={{ marginBottom: 2 }}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            className="nav-item"
            style={{ width: '100%', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────── */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
          background: '#0d1117',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#38bdf8,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>PharmAssist</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#e2e8f0' }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          className="md:hidden"
          style={{ position: 'fixed', inset: 0, top: 57, zIndex: 20, background: '#0d1117', padding: 16, overflowY: 'auto' }}
        >
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`nav-item ${isActive(href) ? 'active' : ''}`}
              style={{ marginBottom: 4 }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* ── Main ────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto' }} className="md:mt-0 mt-14">
        <div style={{ padding: '32px 32px', maxWidth: 1280, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
