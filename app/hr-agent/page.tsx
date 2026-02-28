'use client';

import { useEmployees, useShiftsThisWeek, usePendingAbsences } from '@/hooks/useHRAgent';
import { Users, Calendar, AlertCircle, ShieldCheck, TrendingUp, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const StatCard = ({
  icon: Icon, label, value, sub, colorClass, borderClass, bgClass, href, delay
}: {
  icon: any; label: string; value: string | number; sub: string; colorClass: string; borderClass: string; bgClass: string; href: string; delay: number;
}) => (
  <Link href={href} className="block group">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`relative p-5 rounded-3xl border bg-[#0A0D14] hover:bg-white/[0.02] transition-colors shadow-2xl overflow-hidden`}
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity rounded-full ${bgClass.replace('/10', '')}`} />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${bgClass} ${borderClass} ${colorClass}`}>
          <Icon size={24} />
        </div>
        <div className="p-2 bg-white/5 rounded-full text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
          <ArrowRight size={14} />
        </div>
      </div>

      <div className="relative z-10">
        <div className="text-3xl font-black text-slate-100 mb-1">{value}</div>
        <div className="text-sm font-semibold text-slate-400 mb-1">{label}</div>
        <div className="text-xs text-slate-500 font-medium">{sub}</div>
      </div>
    </motion.div>
  </Link>
);

export default function DashboardPage() {
  const { data: employeesData } = useEmployees();
  const { data: shiftsData } = useShiftsThisWeek();
  const { data: absencesData } = usePendingAbsences();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const employees = employeesData?.results || [];
  const shifts = shiftsData?.shifts || [];
  const pendingAbsences = absencesData?.absences || [];
  const pharmacists = employees.filter((e: any) => e.is_qualified_pharmacist).length;
  const totalHours = shifts.reduce((s: number, sh: any) => s + parseFloat(sh.duration_hours || 0), 0);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto pb-10">
      {/* ── Header ───────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-3 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">Système opérationnel</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-400 to-purple-400 mb-3 tracking-tight">
            {greeting} 👋
          </h1>
          <p className="text-slate-400 font-medium max-w-xl">
            Bienvenue sur PharmAssist · Votre centre de commandement RH intelligent pour l'officine.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative z-10">
          <Link href="/hr-agent/chat">
            <button className="group relative w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl font-bold text-white overflow-hidden transition-all hover:scale-[1.02] shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] border border-white/10">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="text-xl relative z-10">🤖</span>
              <span className="relative z-10">Consulter l'IA</span>
            </button>
          </Link>
        </motion.div>
      </div>

      {/* ── Stat Cards ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={Users} label="Effectif Total" value={employees.length} sub={`${pharmacists} pharmaciens qualifiés`}
          colorClass="text-sky-400" bgClass="bg-sky-500/10" borderClass="border-sky-500/20"
          href="/hr-agent" delay={0.1}
        />
        <StatCard
          icon={Calendar} label="Horaires Hebdo" value={shifts.length} sub={`${totalHours.toFixed(0)}h programmées`}
          colorClass="text-indigo-400" bgClass="bg-indigo-500/10" borderClass="border-indigo-500/20"
          href="/hr-agent/planning" delay={0.2}
        />
        <StatCard
          icon={AlertCircle} label="Congés en Attente" value={pendingAbsences.length} sub="Nécessite approbation"
          colorClass="text-amber-400" bgClass="bg-amber-500/10" borderClass="border-amber-500/20"
          href="/hr-agent/absences" delay={0.3}
        />
        <StatCard
          icon={ShieldCheck} label="Score Conformité" value="85%" sub="Status: Légal"
          colorClass="text-emerald-400" bgClass="bg-emerald-500/10" borderClass="border-emerald-500/20"
          href="/hr-agent/compliance" delay={0.4}
        />
      </div>

      {/* ── Main Grid ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 md:gap-8">
        {/* Shifts list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#0A0D14] rounded-[32px] border border-white/5 shadow-2xl p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-1">Aperçu du Planning</h2>
              <p className="text-sm text-slate-400 font-medium">{shifts.length} créneaux confirmés cette semaine</p>
            </div>
            <Link href="/hr-agent/planning">
              <button className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-xl px-4 py-2 transition-colors">
                Voir tout
              </button>
            </Link>
          </div>

          <div className="flex flex-col gap-3 relative z-10">
            {shifts.slice(0, 6).map((shift: any) => (
              <div key={shift.id} className="group flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center text-sm font-bold text-indigo-300 flex-shrink-0 group-hover:scale-110 transition-transform">
                    {shift.employee_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-200">{shift.employee_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(shift.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className="text-xs font-semibold text-slate-300">
                        {shift.start_time.substring(0, 5)} – {shift.end_time.substring(0, 5)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${shift.status === 'confirmed' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-sky-400 bg-sky-500/10 border border-sky-500/20'}`}>
                    {shift.status_display || shift.status}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{parseFloat(shift.duration_hours || 0)}h</span>
                </div>
              </div>
            ))}

            {shifts.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <Calendar size={48} className="mb-4 opacity-20" />
                <p className="font-medium">Aucun shift programmé cette semaine</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Absences */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#0A0D14] rounded-3xl border border-white/5 shadow-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex justify-between items-center mb-5 relative z-10">
              <h2 className="font-bold text-slate-100 flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-400" />
                À Traiter
              </h2>
              <Link href="/hr-agent/absences">
                <button className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg px-3 py-1.5 transition-colors">
                  Gérer ({pendingAbsences.length})
                </button>
              </Link>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              {pendingAbsences.slice(0, 3).map((absence: any) => (
                <div key={absence.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-slate-200">{absence.employee_name}</p>
                    <p className="text-xs text-amber-400/80 font-medium mt-0.5">{absence.type_display} · {absence.days_count}j</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Clock size={14} />
                  </div>
                </div>
              ))}

              {pendingAbsences.length === 0 && (
                <div className="flex flex-col items-center justify-center p-6 text-slate-500">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                    <CheckCircle size={24} />
                  </div>
                  <p className="text-sm font-medium">Aucune demande en attente</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-[#0A0D14] rounded-3xl border border-white/5 shadow-2xl p-6"
          >
            <h2 className="font-bold text-slate-100 mb-5 text-sm uppercase tracking-widest text-center">Accès Rapide</h2>

            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/hr-agent/planning', label: 'Planning', icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                { href: '/hr-agent/absences', label: 'Absences', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                { href: '/hr-agent/compliance', label: 'Conformité', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                { href: '/hr-agent/chat', label: 'Assistant IA', icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
              ].map(({ href, label, icon: Icon, color, bg, border }) => (
                <Link key={href} href={href} className="group">
                  <div className={`p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] flex flex-col items-center justify-center gap-3 transition-all cursor-pointer h-full`}>
                    <div className={`w-10 h-10 rounded-xl ${bg} ${border} border flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-300 text-center">{label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
