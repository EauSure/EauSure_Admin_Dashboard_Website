'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Clock,
  History,
  RocketIcon,
  Sparkles,
  UploadCloudIcon,
  XCircle,
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/useT';

type FirmwareRelease = {
  _id: string;
  releaseId: string;
  version: string;
  filename: string;
  fileSize: number;
  filePath: string;
  changelog: string;
  uploadedBy: string;
  downloadCount: number;
  createdAt: string;
};

export default function DeployUpdatesPage() {
  const t = useT('deployUpdates');
  const tCommon = useT('common');
  const locale = useLocale();

  const [releases, setReleases] = useState<FirmwareRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [version, setVersion] = useState('');
  const [changelog, setChangelog] = useState('');
  const [expandedReleaseIds, setExpandedReleaseIds] = useState<string[]>([]);
  const [releaseToDelete, setReleaseToDelete] = useState<FirmwareRelease | null>(null);

  const fetchReleases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/firmware', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(typeof payload?.error === 'string' ? payload.error : `HTTP ${res.status}`);
      }

      const data = (await res.json()) as FirmwareRelease[];
      setReleases(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.load');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchReleases();
  }, [fetchReleases]);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.bin')) {
      toast.error(t('errors.invalidFile'));
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(t('errors.fileRequired'));
      return;
    }

    if (!version.trim()) {
      toast.error(t('errors.versionRequired'));
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('version', version.trim());
    formData.append('changelog', changelog.trim());

    setUploading(true);
    setProgress(0);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/firmware');
        xhr.withCredentials = true;

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
            return;
          }

          let errorMessage = t('errors.upload');
          try {
            const payload = JSON.parse(xhr.responseText) as { error?: string };
            if (typeof payload.error === 'string') {
              errorMessage = payload.error;
            }
          } catch {
            // keep default message
          }

          reject(new Error(errorMessage));
        };

        xhr.onerror = () => reject(new Error(t('errors.upload')));
        xhr.send(formData);
      });

      toast.success(t('toasts.uploaded'));
      setSelectedFile(null);
      setVersion('');
      setChangelog('');
      setProgress(0);
      await fetchReleases();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.upload');
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRelease = async () => {
    if (!releaseToDelete) return;

    try {
      const res = await fetch(`/api/admin/firmware/${releaseToDelete.releaseId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(typeof payload?.error === 'string' ? payload.error : t('errors.delete'));
      }

      toast.success(t('toasts.deleted'));
      setReleaseToDelete(null);
      await fetchReleases();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.delete');
      toast.error(message);
    }
  };

  const formatSizeKb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));

  const releasesWithPreview = useMemo(() => {
    return releases.map((release) => {
      const expanded = expandedReleaseIds.includes(release.releaseId);
      const preview = release.changelog.length > 120 && !expanded
        ? `${release.changelog.slice(0, 120)}...`
        : release.changelog;

      return {
        ...release,
        expanded,
        preview,
      };
    });
  }, [expandedReleaseIds, releases]);

  const toggleExpanded = (releaseId: string) => {
    setExpandedReleaseIds((prev) =>
      prev.includes(releaseId) ? prev.filter((id) => id !== releaseId) : [...prev, releaseId]
    );
  };

  const downloadHref = (releaseId: string) => `/api/firmware/${releaseId}/download`;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/70 px-5 py-8 dark:bg-background sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7">
      <div className="mb-6 flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-500">EauSure · Deploy</p>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-foreground">{t('title')}</h1>
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-indigo-500/10 p-3">
              <RocketIcon className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Version active</p>
              <div className="mt-1 flex items-center gap-2">
                <h2 className="text-2xl font-black">v2.4.1</h2>
                <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200">Stable</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Déployée le 8 mai 2026 sur 138 capteurs · Couverture 92 %</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-sm">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Prochaine fenêtre</span>
            <span className="font-semibold">22 mai 2026 — 02:00 UTC</span>
            <span className="text-xs text-muted-foreground">v2.5.0 prévue pour Tunis & Sfax</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-1 border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Notes de version</span>
          </div>
          <h2 className="text-base font-bold">Changelog · 3 dernières versions</h2>
        </div>
        <div className="divide-y">
          {[
            {
              version: 'v2.4.1',
              date: '8 mai 2026',
              tone: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
              tag: 'Stable',
              items: [
                'Correction de la dérive du capteur pH après 72 h de fonctionnement continu.',
                'Réduction de la consommation LoRa de 9 % en mode veille.',
                "Amélioration de l'OTA résiliente sur réseaux instables.",
              ],
            },
            {
              version: 'v2.4.0',
              date: '21 avril 2026',
              tone: 'border-indigo-500/30 bg-indigo-500/15 text-indigo-700 dark:text-indigo-200',
              tag: 'Production',
              items: [
                'Nouveau profil de calibration turbidité optimisé pour eaux saumâtres.',
                'Support des passerelles GW-LoRa-Pro v2 (Sfax, Bizerte).',
                "Ajout d'un mode diagnostic accessible via la console admin.",
              ],
            },
            {
              version: 'v2.3.7',
              date: '12 mars 2026',
              tone: 'border-slate-500/30 bg-slate-500/15 text-slate-600 dark:text-slate-300',
              tag: 'Hotfix',
              items: [
                "Correctif sécurité authentification mTLS sur les passerelles.",
                "Remontée correcte du RSSI en présence d'interférences 868 MHz.",
                'Mise à jour des certificats racines TLS expirant en 2027.',
              ],
            },
          ].map((release) => (
            <div key={release.version} className="px-6 py-5">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="text-base font-bold">{release.version}</span>
                <Badge variant="outline" className={cn('font-semibold', release.tone)}>{release.tag}</Badge>
                <span className="text-xs text-muted-foreground">Publiée le {release.date}</span>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {release.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">{t('uploadSection')}</h2>

        <label
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-colors',
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files.item(0);
            handleFileSelect(file);
          }}
        >
          <UploadCloudIcon className="h-10 w-10 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {selectedFile ? selectedFile.name : t('dropzone')}
          </span>
          <span className="text-xs text-muted-foreground">{t('onlyBin')}</span>
          <input
            type="file"
            accept=".bin"
            className="hidden"
            onChange={(event) => handleFileSelect(event.target.files?.item(0) || null)}
          />
        </label>

        {selectedFile ? (
          <p className="text-sm text-muted-foreground">
            {selectedFile.name} · {formatSizeKb(selectedFile.size)}
          </p>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="firmware-version">{t('version')}</label>
            <Input id="firmware-version" value={version} onChange={(event) => setVersion(event.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="firmware-changelog">{t('changelog')}</label>
          <Textarea
            id="firmware-changelog"
            value={changelog}
            onChange={(event) => setChangelog(event.target.value)}
            maxLength={2000}
            placeholder={t('changelogPlaceholder')}
            className="min-h-28"
          />
        </div>

        {uploading ? <Progress value={progress} /> : null}

        <div className="flex justify-end">
          <Button className="active:scale-95 transition-transform duration-100" onClick={() => void handleUpload()} disabled={uploading}>
            {uploading ? tCommon('loading') : t('uploadBtn')}
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t('releases')}</h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`release-skeleton-${index}`} className="h-28 rounded-2xl border bg-card" />
            ))}
          </div>
        ) : releasesWithPreview.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <UploadCloudIcon className="h-12 w-12 opacity-30" />
            <p className="text-sm">{t('noReleases')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {releasesWithPreview.map((release) => (
              <div key={release.releaseId} className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">{release.releaseId}</Badge>
                    <span className="text-lg font-semibold">{release.version}</span>
                  </div>
                  <Badge variant="secondary">{release.downloadCount} {t('downloads')}</Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {formatDate(release.createdAt)} · {formatSizeKb(release.fileSize)} · {t('uploadedBy')} {release.uploadedBy}
                </p>

                <div className="text-sm">
                  <p>
                    {t('changelog')}: {release.preview || '-'}
                  </p>
                  {release.changelog.length > 120 ? (
                    <button className="mt-1 text-xs text-primary hover:underline" onClick={() => toggleExpanded(release.releaseId)}>
                      {release.expanded ? t('showLess') : t('showMore')}
                    </button>
                  ) : null}
                </div>

                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline">
                    <a href={downloadHref(release.releaseId)}>{t('download')}</a>
                  </Button>
                  <Button variant="destructive" className="active:scale-95 transition-transform duration-100" onClick={() => setReleaseToDelete(release)}>
                    {t('delete')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-1 border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <RocketIcon className="h-4 w-4 text-indigo-500" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">État du parc</span>
          </div>
          <h2 className="text-base font-bold">Statut de mise à jour des appareils</h2>
          <p className="text-xs text-muted-foreground">Suivi par appareil de la version courante et de la version disponible.</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Version actuelle</TableHead>
              <TableHead>Version disponible</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-end" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { id: 'CAP-PH-014', current: 'v2.4.1', available: 'v2.4.1', status: 'À jour', tone: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200' },
              { id: 'CAP-TUR-007', current: 'v2.4.0', available: 'v2.4.1', status: 'Mise à jour disponible', tone: 'border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-200' },
              { id: 'GW-SOU-04', current: 'v2.4.1', available: 'v2.4.1', status: 'À jour', tone: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200' },
              { id: 'CAP-PH-018', current: 'v2.3.7', available: 'v2.4.1', status: 'Mise à jour disponible', tone: 'border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-200' },
              { id: 'CAP-TUR-011', current: 'v2.4.0', available: 'v2.4.1', status: 'En cours de déploiement', tone: 'border-indigo-500/30 bg-indigo-500/15 text-indigo-700 dark:text-indigo-200' },
              { id: 'GW-TUN-02', current: 'v2.4.1', available: 'v2.4.1', status: 'À jour', tone: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200' },
            ].map((device) => (
              <TableRow key={device.id}>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">{device.id}</Badge>
                </TableCell>
                <TableCell className="text-sm">{device.current}</TableCell>
                <TableCell className="text-sm">{device.available}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('font-semibold', device.tone)}>{device.status}</Badge>
                </TableCell>
                <TableCell className="text-end">
                  {device.status === 'Mise à jour disponible' ? (
                    <Button
                      size="sm"
                      className="active:scale-95 transition-transform duration-100"
                      onClick={() => toast.success(`Déploiement v${device.available.replace('v', '')} planifié sur ${device.id}.`)}
                    >
                      Déployer
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-1 border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-indigo-500" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Journal</span>
          </div>
          <h2 className="text-base font-bold">Historique des déploiements</h2>
          <p className="text-xs text-muted-foreground">Cinq derniers déploiements consignés par la plateforme.</p>
        </div>
        <ul className="divide-y">
          {[
            { date: '8 mai 2026 — 02:14', device: 'CAP-PH-014 · Tunis Centre', version: 'v2.4.1', result: 'Succès' },
            { date: '8 mai 2026 — 02:11', device: 'GW-TUN-02 · Mégrine', version: 'v2.4.1', result: 'Succès' },
            { date: '7 mai 2026 — 23:48', device: 'CAP-TUR-011 · Bizerte', version: 'v2.4.1', result: 'Échec' },
            { date: '7 mai 2026 — 22:30', device: 'GW-SOU-04 · Sousse Port', version: 'v2.4.1', result: 'Succès' },
            { date: '21 avril 2026 — 03:02', device: 'CAP-PH-018 · Sfax Sidi Mansour', version: 'v2.4.0', result: 'Succès' },
          ].map((entry) => {
            const success = entry.result === 'Succès';
            return (
              <li key={`${entry.date}-${entry.device}`} className="flex items-start gap-3 px-6 py-3">
                <div className={cn('mt-0.5 rounded-lg p-2', success ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-600 dark:bg-red-500/10')}>
                  {success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{entry.device}</p>
                  <p className="text-xs text-muted-foreground"><Clock className="me-1 inline h-3 w-3" />{entry.date} · {entry.version}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'shrink-0 font-semibold',
                    success
                      ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200'
                      : 'border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-200'
                  )}
                >
                  {entry.result}
                </Badge>
              </li>
            );
          })}
        </ul>
      </section>

      <AlertDialog open={!!releaseToDelete} onOpenChange={(open) => !open && setReleaseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('discard')}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => void handleDeleteRelease()}>
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
