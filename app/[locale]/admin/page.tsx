'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Users,
  Activity,
  Rocket,
  Stethoscope,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  PackagePlus,
  CloudDownload,
  Wrench,
  UserPlus,
  Droplets,
  TicketCheck,
  Database,
  Network,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useT } from '@/lib/useT';

export default function AdminDashboardPage() {
  const t = useT('admin');
  const locale = useLocale();

  const adminModules = [
    {
      title: t('manageUsers.title'),
      description: t('manageUsers.description'),
      href: `/${locale}/admin/manage-users`,
      icon: Users,
    },
    {
      title: t('superviseSystem.title'),
      description: t('superviseSystem.description'),
      href: `/${locale}/admin/supervise-system`,
      icon: Activity,
    },
    {
      title: t('deployUpdates.title'),
      description: t('deployUpdates.description'),
      href: `/${locale}/admin/deploy-updates`,
      icon: Rocket,
    },
    {
      title: t('diagnoseProblems.title'),
      description: t('diagnoseProblems.description'),
      href: `/${locale}/admin/diagnose-problems`,
      icon: Stethoscope,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/70 px-5 py-8 dark:bg-background sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0 }}>
          <div className="mb-6 flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-500">EauSure · Admin</p>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-foreground">{t('title')}</h1>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-muted-foreground">{t('description')}</p>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          {adminModules.map((module, index) => (
            <motion.div
              key={module.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.07 + index * 0.07 }}
              whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              whileTap={{ y: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-border dark:bg-card"
            >
              <div className="py-5 ps-6 pe-5">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Admin module</span>
                    <span className="text-base font-bold text-gray-900 dark:text-foreground">{module.title}</span>
                  </div>
                  <div className="rounded-lg bg-indigo-50 p-2 transition-transform duration-200 group-hover:scale-110 dark:bg-indigo-500/10">
                    <module.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <p className="mb-5 text-sm text-gray-500 dark:text-muted-foreground">{module.description}</p>
                <Button asChild className="active:scale-95 transition-transform duration-100">
                  <Link href={module.href}>Open</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-border dark:bg-card"
        >
          <div className="flex flex-col gap-1 border-b border-gray-100 px-6 py-4 dark:border-border">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">État global</span>
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-foreground">Santé du système EauSûre</h2>
            <p className="text-xs text-gray-400 dark:text-muted-foreground">Synthèse en temps réel de la plateforme et des passerelles déployées en Tunisie.</p>
          </div>

          <div className="grid divide-y divide-gray-100 dark:divide-border md:grid-cols-4 md:divide-x md:divide-y-0">
            <div className="flex flex-col gap-1 px-6 py-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                <Activity className="h-3.5 w-3.5" /> Disponibilité
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-foreground">99,87 %</p>
              <p className="text-xs text-emerald-600">Sur les 30 derniers jours</p>
            </div>
            <div className="flex flex-col gap-1 px-6 py-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                <Cpu className="h-3.5 w-3.5" /> Capteurs actifs
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-foreground">142 / 150</p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">8 hors ligne (5,3 %)</p>
            </div>
            <div className="flex flex-col gap-1 px-6 py-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Alertes aujourd&apos;hui
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-foreground">7</p>
              <p className="text-xs text-amber-600">2 critiques · 5 mineures</p>
            </div>
            <div className="flex flex-col gap-1 px-6 py-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                <Network className="h-3.5 w-3.5" /> Passerelles LoRa
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-foreground">12 / 12</p>
              <p className="text-xs text-emerald-600">Toutes opérationnelles</p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.45 }}
            className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-border dark:bg-card lg:col-span-2"
          >
            <div className="flex flex-col gap-1 border-b border-gray-100 px-6 py-4 dark:border-border">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-indigo-500" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Qualité de l&apos;eau · cette semaine</span>
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-foreground">Relevés moyens pH & turbidité</h2>
              <p className="text-xs text-gray-400 dark:text-muted-foreground">Moyennes journalières consolidées sur l&apos;ensemble des sites tunisiens.</p>
            </div>

            <div className="px-3 pb-5 pt-4 sm:px-6">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { day: 'Lun', ph: 7.2, turbidity: 2.1 },
                      { day: 'Mar', ph: 7.3, turbidity: 1.9 },
                      { day: 'Mer', ph: 7.1, turbidity: 2.4 },
                      { day: 'Jeu', ph: 7.4, turbidity: 2.0 },
                      { day: 'Ven', ph: 7.2, turbidity: 2.6 },
                      { day: 'Sam', ph: 7.5, turbidity: 1.8 },
                      { day: 'Dim', ph: 7.3, turbidity: 2.0 },
                    ]}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#6366f1" fontSize={12} tickLine={false} axisLine={false} domain={[6.5, 8]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" fontSize={12} tickLine={false} axisLine={false} domain={[0, 4]} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.92)',
                        border: 'none',
                        borderRadius: 12,
                        color: '#e2e8f0',
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ fontSize: 12, color: '#64748b' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="ph" name="pH moyen" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line yAxisId="right" type="monotone" dataKey="turbidity" name="Turbidité (NTU)" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-border dark:bg-card"
          >
            <div className="flex flex-col gap-1 border-b border-gray-100 px-6 py-4 dark:border-border">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Activité récente</span>
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-foreground">Flux opérationnel</h2>
              <p className="text-xs text-gray-400 dark:text-muted-foreground">Derniers événements consignés sur la plateforme.</p>
            </div>

            <ul className="divide-y divide-gray-100 dark:divide-border">
              {[
                { icon: AlertTriangle, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10', title: 'Alerte pH élevé · CAP-PH-018', detail: 'Site Sfax — 7,9 pH détecté', time: 'il y a 4 min' },
                { icon: CloudDownload, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10', title: 'Mise à jour v2.4.1 déployée', detail: '6 capteurs Tunis Nord', time: 'il y a 22 min' },
                { icon: PackagePlus, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10', title: 'Nouvel équipement enregistré', detail: 'Passerelle LoRa GW-SOU-04', time: 'il y a 1 h' },
                { icon: TicketCheck, color: 'text-sky-500 bg-sky-50 dark:bg-sky-500/10', title: 'Réclamation résolue · #TCK-1042', detail: 'Coupure réseau Bizerte', time: 'il y a 2 h' },
                { icon: UserPlus, color: 'text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-500/10', title: 'Nouvel opérateur activé', detail: 'amine.bouzid@eausure.tn', time: 'il y a 3 h' },
                { icon: Wrench, color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10', title: 'Maintenance préventive terminée', detail: 'Capteur turbidité TUR-007', time: 'il y a 5 h' },
                { icon: Database, color: 'text-slate-500 bg-slate-100 dark:bg-slate-500/10', title: 'Sauvegarde MongoDB effectuée', detail: '4,2 Go archivés', time: 'il y a 7 h' },
                { icon: Network, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10', title: 'Passerelle Sousse reconnectée', detail: 'GW-SOU-02 · liaison rétablie', time: 'hier 21:47' },
              ].map((event) => (
                <li key={event.title} className="flex items-start gap-3 px-6 py-3">
                  <div className={`mt-0.5 rounded-lg p-2 ${event.color}`}>
                    <event.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-foreground">{event.title}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-muted-foreground">{event.detail}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-gray-400 dark:text-muted-foreground">{event.time}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
