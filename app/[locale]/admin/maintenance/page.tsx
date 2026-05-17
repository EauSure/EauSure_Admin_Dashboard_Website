'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Cog,
  FileText,
  PackageCheck,
  PlayCircle,
  Rocket,
  Wrench,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type ScheduleStatus = 'Planifiée' | 'En cours' | 'Terminée';
type ScheduleType = 'Préventive' | 'Corrective';

const statusToneMap: Record<ScheduleStatus, string> = {
  Planifiée: 'border-indigo-500/30 bg-indigo-500/15 text-indigo-700 dark:text-indigo-200',
  'En cours': 'border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-200',
  Terminée: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
};

const typeToneMap: Record<ScheduleType, string> = {
  Préventive: 'border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-200',
  Corrective: 'border-orange-500/30 bg-orange-500/15 text-orange-700 dark:text-orange-200',
};

export default function MaintenancePage() {
  const [scheduleForm, setScheduleForm] = useState({
    date: '2026-05-24',
    type: 'Préventive' as ScheduleType,
    technician: 'Mehdi Trabelsi',
    device: 'CAP-PH-018 · Sfax Sidi Mansour',
  });

  const [firmwareForm, setFirmwareForm] = useState({
    version: 'v2.5.0',
    notes:
      "Optimisation de la calibration turbidité, support des passerelles GW-LoRa-Pro v3, durcissement TLS et nouveau mode économie d'énergie.",
    releaseDate: '2026-06-04',
  });

  const handleScheduleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success(`Maintenance ${scheduleForm.type.toLowerCase()} planifiée le ${scheduleForm.date}.`);
  };

  const handleFirmwareSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success(`Version firmware ${firmwareForm.version} déclarée pour le ${firmwareForm.releaseDate}.`);
  };

  const schedule: {
    date: string;
    type: ScheduleType;
    technician: string;
    device: string;
    status: ScheduleStatus;
  }[] = [
    { date: '12 mai 2026 — 09:30', type: 'Préventive', technician: 'Yosra Ben Salah', device: 'GW-TUN-02 · Mégrine', status: 'Terminée' },
    { date: '15 mai 2026 — 14:00', type: 'Corrective', technician: 'Hatem Khelifi', device: 'CAP-TUR-007 · Sfax', status: 'En cours' },
    { date: '17 mai 2026 — 08:00', type: 'Préventive', technician: 'Mehdi Trabelsi', device: 'CAP-PH-014 · Tunis Centre', status: 'Planifiée' },
    { date: '21 mai 2026 — 10:15', type: 'Corrective', technician: 'Rania Hammami', device: 'CAP-PH-018 · Sfax Sidi Mansour', status: 'Planifiée' },
    { date: '24 mai 2026 — 13:30', type: 'Préventive', technician: 'Sami Gharbi', device: 'GW-SOU-04 · Sousse Port', status: 'Planifiée' },
  ];

  const journal = [
    { date: '11 mai 2026 — 16:42', action: 'Remplacement membrane pH sur CAP-PH-014', technician: 'Yosra Ben Salah', result: 'Calibration validée' },
    { date: '9 mai 2026 — 11:18', action: 'Nettoyage capteur turbidité TUR-009', technician: 'Mehdi Trabelsi', result: 'Conforme' },
    { date: '6 mai 2026 — 22:05', action: "Redémarrage passerelle GW-BIZ-01 suite à perte d'antenne", technician: 'Hatem Khelifi', result: 'Liaison rétablie' },
    { date: '4 mai 2026 — 10:30', action: 'Mise à jour batterie Li-ion CAP-PH-016', technician: 'Sami Gharbi', result: 'Autonomie 14 jours' },
    { date: '2 mai 2026 — 15:20', action: 'Recalibration turbidité TUR-005', technician: 'Rania Hammami', result: 'Écart < 0,2 NTU' },
    { date: '29 avril 2026 — 09:45', action: 'Inspection visuelle GW-SOU-04', technician: 'Mehdi Trabelsi', result: 'Aucune anomalie' },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/70 px-5 py-8 dark:bg-background sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="mb-2 flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-500">EauSure · Maintenance</p>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-foreground">Maintenir le système</h1>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-muted-foreground">
              Planification, suivi et journalisation des interventions sur le parc EauSûre.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Maintenances planifiées</p>
            <p className="text-2xl font-bold text-indigo-600">14</p>
            <p className="mt-1 text-xs text-muted-foreground">Sur les 30 prochains jours</p>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">En cours</p>
            <p className="text-2xl font-bold text-amber-600">3</p>
            <p className="mt-1 text-xs text-muted-foreground">2 préventives · 1 corrective</p>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Terminées ce mois</p>
            <p className="text-2xl font-bold text-emerald-600">21</p>
            <p className="mt-1 text-xs text-emerald-600">+18 % vs mois précédent</p>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Prochaine maintenance</p>
            <p className="text-2xl font-bold">17 mai 2026</p>
            <p className="mt-1 text-xs text-muted-foreground">CAP-PH-014 · Tunis Centre</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-1 border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-indigo-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Calendrier</span>
            </div>
            <h2 className="text-base font-bold">Planning des maintenances</h2>
            <p className="text-xs text-muted-foreground">Interventions programmées sur les capteurs et passerelles tunisiens.</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Technicien</TableHead>
                <TableHead>Appareil</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((entry) => (
                <TableRow key={`${entry.date}-${entry.device}`}>
                  <TableCell className="text-sm">{entry.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('font-semibold', typeToneMap[entry.type])}>{entry.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{entry.technician}</TableCell>
                  <TableCell className="text-sm">{entry.device}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('font-semibold', statusToneMap[entry.status])}>{entry.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-1 border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-indigo-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Journal</span>
            </div>
            <h2 className="text-base font-bold">Journal de maintenance</h2>
            <p className="text-xs text-muted-foreground">Six dernières interventions consignées par les techniciens terrain.</p>
          </div>
          <ul className="divide-y">
            {journal.map((entry) => (
              <li key={`${entry.date}-${entry.action}`} className="flex items-start gap-3 px-6 py-3">
                <div className="mt-0.5 rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{entry.action}</p>
                  <p className="text-xs text-muted-foreground">{entry.date} · {entry.technician}</p>
                </div>
                <Badge variant="outline" className="shrink-0 border-emerald-500/30 bg-emerald-500/15 font-semibold text-emerald-700 dark:text-emerald-200">
                  {entry.result}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card shadow-sm">
            <div className="flex flex-col gap-1 border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-indigo-500" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Planification</span>
              </div>
              <h2 className="text-base font-bold">Planifier une maintenance</h2>
              <p className="text-xs text-muted-foreground">Pré-rempli avec une intervention type, ajustez avant validation.</p>
            </div>
            <form onSubmit={handleScheduleSubmit} className="grid gap-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="schedule-date">Date</label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduleForm.date}
                    onChange={(event) => setScheduleForm((prev) => ({ ...prev, date: event.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="schedule-type">Type</label>
                  <Select
                    value={scheduleForm.type}
                    onValueChange={(value: ScheduleType) => setScheduleForm((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="schedule-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Préventive">Préventive</SelectItem>
                      <SelectItem value="Corrective">Corrective</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="schedule-technician">Technicien</label>
                <Select
                  value={scheduleForm.technician}
                  onValueChange={(value) => setScheduleForm((prev) => ({ ...prev, technician: value }))}
                >
                  <SelectTrigger id="schedule-technician">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mehdi Trabelsi">Mehdi Trabelsi</SelectItem>
                    <SelectItem value="Yosra Ben Salah">Yosra Ben Salah</SelectItem>
                    <SelectItem value="Hatem Khelifi">Hatem Khelifi</SelectItem>
                    <SelectItem value="Rania Hammami">Rania Hammami</SelectItem>
                    <SelectItem value="Sami Gharbi">Sami Gharbi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="schedule-device">Appareil</label>
                <Input
                  id="schedule-device"
                  value={scheduleForm.device}
                  onChange={(event) => setScheduleForm((prev) => ({ ...prev, device: event.target.value }))}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="active:scale-95 transition-transform duration-100">
                  <PlayCircle className="me-2 h-4 w-4" /> Planifier
                </Button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border bg-card shadow-sm">
            <div className="flex flex-col gap-1 border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-indigo-500" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Firmware</span>
              </div>
              <h2 className="text-base font-bold">Nouvelle version firmware</h2>
              <p className="text-xs text-muted-foreground">Déclarez une version qui apparaîtra ensuite dans l&apos;espace Déployer les mises à jour.</p>
            </div>
            <form onSubmit={handleFirmwareSubmit} className="grid gap-4 p-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="firmware-version">Numéro de version</label>
                <Input
                  id="firmware-version"
                  value={firmwareForm.version}
                  onChange={(event) => setFirmwareForm((prev) => ({ ...prev, version: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="firmware-notes">Notes de version</label>
                <Textarea
                  id="firmware-notes"
                  value={firmwareForm.notes}
                  onChange={(event) => setFirmwareForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="min-h-32"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="firmware-release-date">Date de release</label>
                <Input
                  id="firmware-release-date"
                  type="date"
                  value={firmwareForm.releaseDate}
                  onChange={(event) => setFirmwareForm((prev) => ({ ...prev, releaseDate: event.target.value }))}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Brouillon synchronisé avec « Déployer les mises à jour ».</span>
                <span className="inline-flex items-center gap-2"><PackageCheck className="h-3.5 w-3.5" /> Statut : Pré-publication</span>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="active:scale-95 transition-transform duration-100">
                  <Cog className="me-2 h-4 w-4" /> Déclarer la version
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
