'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Cpu,
  Droplets,
  Gauge,
  HeartPulse,
  MoreHorizontal,
  PackagePlus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Smile,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/useT';

type NodeStatusFilter = 'all' | 'active' | 'inactive';

type IotNode = {
  _id: string;
  nodeId: string;
  deviceId: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  firmwareVersion: string;
  isActive: boolean;
  lastSeen: string | null;
  location?: string;
  createdAt: string;
  updatedAt: string;
};

export default function SuperviseSystemPage() {
  const t = useT('superviseSystem');
  const tCommon = useT('common');
  const locale = useLocale();

  const [nodes, setNodes] = useState<IotNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<NodeStatusFilter>('all');
  const [firmwareFilter, setFirmwareFilter] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<IotNode | null>(null);
  const [locationDraft, setLocationDraft] = useState('');
  const [firmwareDraft, setFirmwareDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchNodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/nodes', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(typeof payload?.error === 'string' ? payload.error : `HTTP ${res.status}`);
      }

      const data = (await res.json()) as IotNode[];
      setNodes(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.load');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchNodes();
  }, [fetchNodes]);

  const filteredNodes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return nodes.filter((node) => {
      const statusMatches =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? node.isActive : !node.isActive);

      const firmwareMatches = firmwareFilter === 'all' || node.firmwareVersion === firmwareFilter;

      const searchMatches =
        !query ||
        node.nodeId.toLowerCase().includes(query) ||
        node.ownerName.toLowerCase().includes(query) ||
        node.ownerEmail.toLowerCase().includes(query) ||
        (node.location || '').toLowerCase().includes(query);

      return statusMatches && firmwareMatches && searchMatches;
    });
  }, [firmwareFilter, nodes, search, statusFilter]);

  const firmwareOptions = useMemo(() => {
    return Array.from(new Set(nodes.map((node) => node.firmwareVersion).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [nodes]);

  const stats = useMemo(() => {
    const totalNodes = nodes.length;
    const activeNow = nodes.filter((node) => node.isActive).length;
    const inactive = totalNodes - activeNow;
    const uniqueOwners = new Set(nodes.map((node) => node.ownerId)).size;

    return { totalNodes, activeNow, inactive, uniqueOwners };
  }, [nodes]);

  const formatRelativeLastSeen = (value: string | null) => {
    if (!value) return t('never');

    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return t('never');

    const diffMs = Date.now() - timestamp;
    const minutes = Math.floor(diffMs / 60_000);
    const hours = Math.floor(diffMs / 3_600_000);

    if (minutes < 1) return t('time.justNow');
    if (minutes < 60) return t('time.minutesAgo', { count: minutes });
    if (hours < 24) return t('time.hoursAgo', { count: hours });

    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  };

  const openNodeDetail = (node: IotNode) => {
    setSelectedNode(node);
    setLocationDraft(node.location || '');
    setFirmwareDraft(node.firmwareVersion || '');
    setDetailOpen(true);
  };

  const saveNode = async () => {
    if (!selectedNode) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/nodes/${selectedNode._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: locationDraft,
          firmwareVersion: firmwareDraft,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(typeof payload?.error === 'string' ? payload.error : t('errors.save'));
      }

      toast.success(t('toasts.saved'));
      setDetailOpen(false);
      await fetchNodes();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.save');
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const [preregisterForm, setPreregisterForm] = useState({
    deviceId: 'CAP-PH-019',
    type: 'Capteur pH',
    location: 'Tunis Nord — Réservoir El Menzah',
    installDate: '2026-05-22',
  });

  const handlePreregisterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success(`Équipement ${preregisterForm.deviceId} pré-enregistré.`);
  };

  const preregisteredDevices = [
    { id: 'CAP-PH-014', type: 'Capteur pH', location: 'Tunis Centre — Bab Bhar', status: 'En ligne', lastSync: 'il y a 3 min' },
    { id: 'CAP-TUR-007', type: 'Capteur turbidité', location: 'Sfax — Station El Aïn', status: 'En ligne', lastSync: 'il y a 6 min' },
    { id: 'GW-SOU-04', type: 'Passerelle LoRa', location: 'Sousse — Port commercial', status: 'En ligne', lastSync: 'il y a 1 min' },
    { id: 'CAP-PH-018', type: 'Capteur pH', location: 'Sfax — Réservoir Sidi Mansour', status: 'Hors ligne', lastSync: 'il y a 2 j' },
    { id: 'CAP-TUR-011', type: 'Capteur turbidité', location: 'Bizerte — Lac Ichkeul', status: 'En ligne', lastSync: 'il y a 9 min' },
    { id: 'GW-TUN-02', type: 'Passerelle LoRa', location: 'Tunis Sud — Mégrine', status: 'En ligne', lastSync: 'il y a 4 min' },
  ];

  const monthlyStats = [
    { icon: Droplets, label: 'Total relevés ce mois', value: '184 320', sub: '+12,4 % vs mois précédent', tone: 'text-indigo-600' },
    { icon: CircleAlert, label: 'Anomalies détectées', value: '37', sub: '6 critiques · 31 mineures', tone: 'text-amber-600' },
    { icon: Gauge, label: 'pH moyen', value: '7,28', sub: 'Plage cible 6,5 – 8,5', tone: 'text-emerald-600' },
    { icon: Activity, label: 'Turbidité moyenne', value: '2,1 NTU', sub: 'Conforme OMS (< 5 NTU)', tone: 'text-sky-600' },
  ];

  const effectivenessKpis = [
    { icon: HeartPulse, label: "Disponibilité de la solution", value: 99.87, suffix: '%', tone: 'bg-emerald-500' },
    { icon: CheckCircle2, label: 'Taux de résolution des incidents', value: 94.2, suffix: '%', tone: 'bg-indigo-500' },
    { icon: Smile, label: 'Satisfaction utilisateurs', value: 88, suffix: '%', tone: 'bg-fuchsia-500' },
    { icon: Timer, label: 'Temps de réponse moyen', value: 72, suffix: ' min', tone: 'bg-sky-500', max: 240 },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/70 px-5 py-8 dark:bg-background sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7">
      <div className="mb-6 flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-500">EauSure · Supervision</p>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-foreground">{t('title')}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{t('totalNodes')}</p>
          <p className="text-2xl font-bold">{stats.totalNodes}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{t('activeNow')}</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.activeNow}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{t('inactive')}</p>
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{t('uniqueOwners')}</p>
          <p className="text-2xl font-bold">{stats.uniqueOwners}</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="ps-9"
            placeholder={t('searchPlaceholder')}
          />
        </div>

        <Select value={statusFilter} onValueChange={(value: NodeStatusFilter) => setStatusFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder={t('filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.all')}</SelectItem>
            <SelectItem value="active">{t('statuses.active')}</SelectItem>
            <SelectItem value="inactive">{t('statuses.inactive')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={firmwareFilter} onValueChange={setFirmwareFilter}>
          <SelectTrigger>
            <SelectValue placeholder={t('filters.firmware')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allFirmware')}</SelectItem>
            {firmwareOptions.map((version) => (
              <SelectItem key={version} value={version}>
                {version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3 rounded-2xl border bg-card p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`node-row-${index}`} className="h-12 w-full" />
          ))}
        </div>
      ) : filteredNodes.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">{t('noNodes')}</div>
      ) : (
        <div className="rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.nodeId')}</TableHead>
                <TableHead>{t('columns.owner')}</TableHead>
                <TableHead>{t('columns.location')}</TableHead>
                <TableHead>{t('columns.firmware')}</TableHead>
                <TableHead>{t('columns.status')}</TableHead>
                <TableHead>{t('columns.lastSeen')}</TableHead>
                <TableHead className="text-end" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNodes.map((node) => (
                <TableRow key={node._id} className="cursor-pointer" onClick={() => openNodeDetail(node)}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {node.nodeId}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{node.ownerName}</p>
                    <p className="text-xs text-muted-foreground">{node.ownerEmail}</p>
                  </TableCell>
                  <TableCell>
                    <span className={cn('text-sm', !node.location && 'text-muted-foreground')}>{node.location || t('never')}</span>
                  </TableCell>
                  <TableCell>
                    <span className="rounded px-2 py-1 text-xs text-blue-600 bg-blue-500/10">{node.firmwareVersion}</span>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-2">
                      <span
                        className={cn(
                          'relative inline-flex h-2.5 w-2.5 rounded-full',
                          node.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                        )}
                      >
                        {node.isActive ? <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" /> : null}
                      </span>
                      <span className="text-sm">{node.isActive ? t('statuses.active') : t('statuses.inactive')}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatRelativeLastSeen(node.lastSeen)}</TableCell>
                  <TableCell className="text-end" onClick={(event) => event.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="active:scale-95 transition-transform duration-100">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openNodeDetail(node)}>{t('editNode')}</DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/${locale}/dashboard/alerts?deviceId=${encodeURIComponent(node.deviceId)}`}>
                            {t('viewData')}
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full max-w-xl rounded-2xl p-0">
          {selectedNode ? (
            <>
              <div className={cn('h-2 w-full', selectedNode.isActive ? 'bg-emerald-500' : 'bg-red-500')} />
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle>{selectedNode.nodeId}</SheetTitle>
                  <SheetDescription>{t('editNode')}</SheetDescription>
                </SheetHeader>

                <div className="mt-5 grid gap-4">
                  <div className="grid gap-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('columns.owner')}</p>
                    <p className="text-sm font-medium">{selectedNode.ownerName}</p>
                    <p className="text-xs text-muted-foreground">{selectedNode.ownerEmail}</p>
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor="node-location">
                      {t('columns.location')}
                    </label>
                    <Input
                      id="node-location"
                      value={locationDraft}
                      onChange={(event) => setLocationDraft(event.target.value)}
                      placeholder={t('locationPlaceholder')}
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor="node-firmware">
                      {t('columns.firmware')}
                    </label>
                    <Input
                      id="node-firmware"
                      value={firmwareDraft}
                      onChange={(event) => setFirmwareDraft(event.target.value)}
                    />
                  </div>

                  <div className="grid gap-1 text-sm text-muted-foreground">
                    <p>{t('columns.lastSeen')}: {formatRelativeLastSeen(selectedNode.lastSeen)}</p>
                    <p>{t('deviceIdLabel')}: {selectedNode.deviceId}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setDetailOpen(false)}>
                    {tCommon('discard')}
                  </Button>
                  <Button className="active:scale-95 transition-transform duration-100" onClick={() => void saveNode()} disabled={saving}>
                    {saving ? tCommon('loading') : tCommon('save')}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Appareils actifs</p>
          <p className="text-2xl font-bold text-emerald-600">142</p>
          <p className="mt-1 text-xs text-muted-foreground">94,7 % du parc</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Hors ligne</p>
          <p className="text-2xl font-bold text-red-600">8</p>
          <p className="mt-1 text-xs text-muted-foreground">3 en intervention</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Dernière synchronisation</p>
          <p className="text-2xl font-bold">il y a 2 min</p>
          <p className="mt-1 text-xs text-muted-foreground">Passerelle Tunis Centre</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total relevés ce mois</p>
          <p className="text-2xl font-bold">184 320</p>
          <p className="mt-1 text-xs text-emerald-600">+12,4 %</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-1 border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-500" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Parc déployé</span>
          </div>
          <h2 className="text-base font-bold">Équipements pré-enregistrés</h2>
          <p className="text-xs text-muted-foreground">Capteurs et passerelles déployés sur le territoire tunisien.</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernière sync</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preregisteredDevices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">{device.id}</Badge>
                </TableCell>
                <TableCell className="text-sm">{device.type}</TableCell>
                <TableCell className="text-sm">{device.location}</TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-2">
                    <span
                      className={cn(
                        'relative inline-flex h-2.5 w-2.5 rounded-full',
                        device.status === 'En ligne' ? 'bg-emerald-500' : 'bg-red-500'
                      )}
                    >
                      {device.status === 'En ligne' ? (
                        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
                      ) : null}
                    </span>
                    <span className="text-sm">{device.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{device.lastSync}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-5 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-500/20">
            <ShieldCheck className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">État global</p>
            <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-100">Opérationnel</h3>
            <p className="text-sm text-emerald-800/90 dark:text-emerald-100/80">Tous les services critiques répondent dans les seuils. Aucune dégradation détectée sur les passerelles tunisiennes.</p>
          </div>
          <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200">Stable</Badge>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-1 border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <PackagePlus className="h-4 w-4 text-indigo-500" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Pré-enregistrement</span>
          </div>
          <h2 className="text-base font-bold">Pré-enregistrer un équipement</h2>
          <p className="text-xs text-muted-foreground">Créez la fiche logique avant l&apos;installation sur site.</p>
        </div>
        <form onSubmit={handlePreregisterSubmit} className="grid gap-4 p-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="prereg-device-id">ID appareil</label>
            <Input
              id="prereg-device-id"
              value={preregisterForm.deviceId}
              onChange={(event) => setPreregisterForm((prev) => ({ ...prev, deviceId: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="prereg-type">Type</label>
            <Select
              value={preregisterForm.type}
              onValueChange={(value) => setPreregisterForm((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger id="prereg-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Capteur pH">Capteur pH</SelectItem>
                <SelectItem value="Capteur turbidité">Capteur turbidité</SelectItem>
                <SelectItem value="Passerelle LoRa">Passerelle LoRa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="prereg-location">Localisation</label>
            <Input
              id="prereg-location"
              value={preregisterForm.location}
              onChange={(event) => setPreregisterForm((prev) => ({ ...prev, location: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="prereg-install-date">Date d&apos;installation</label>
            <Input
              id="prereg-install-date"
              type="date"
              value={preregisterForm.installDate}
              onChange={(event) => setPreregisterForm((prev) => ({ ...prev, installDate: event.target.value }))}
            />
          </div>
          <div className="flex items-end justify-end md:col-span-2">
            <Button type="submit" className="active:scale-95 transition-transform duration-100">
              <PackagePlus className="me-2 h-4 w-4" /> Pré-enregistrer
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-1 border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 text-indigo-500" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Statistiques & retours</span>
          </div>
          <h2 className="text-base font-bold">Collecte mensuelle</h2>
          <p className="text-xs text-muted-foreground">Indicateurs consolidés sur les 30 derniers jours.</p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {monthlyStats.map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className={cn('rounded-lg p-2 bg-muted', stat.tone)}>
                  <stat.icon className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">30 j</span>
              </div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-xs text-emerald-600">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-1 border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Efficacité</span>
          </div>
          <h2 className="text-base font-bold">Efficacité de la solution</h2>
          <p className="text-xs text-muted-foreground">KPI de performance consolidés sur la flotte EauSûre.</p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {effectivenessKpis.map((kpi) => {
            const max = kpi.max ?? 100;
            const pct = Math.min(100, Math.round((kpi.value / max) * 100));
            const display = kpi.suffix === '%' ? `${kpi.value} ${kpi.suffix}` : `${kpi.value}${kpi.suffix}`;

            return (
              <div key={kpi.label} className="rounded-xl border bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className={cn('rounded-lg p-2 text-white', kpi.tone)}>
                    <kpi.icon className="h-4 w-4" />
                  </span>
                  <span className="text-2xl font-black">{display}</span>
                </div>
                <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                <Progress value={pct} className="mt-3 h-1.5" />
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
