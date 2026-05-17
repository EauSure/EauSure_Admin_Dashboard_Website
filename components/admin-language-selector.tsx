'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useT } from '@/lib/useT';

const LOCALES = [
  { code: 'fr', labelKey: 'localeNames.fr', flag: 'FR' },
  { code: 'en', labelKey: 'localeNames.en', flag: 'EN' },
  { code: 'ar', labelKey: 'localeNames.ar', flag: 'AR' },
] as const;

export function AdminLanguageSelector() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useT('common');
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; samesite=lax`;

    void fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale }),
    }).catch(() => {});

    const segments = pathname.split('/');
    if (segments[1] && ['fr', 'en', 'ar'].includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const nextPath = segments.join('/') || `/${newLocale}`;

    startTransition(() => {
      router.replace(nextPath);
      router.refresh();
    });
  };

  return (
    <div className="inline-flex items-center">
      <select
        value={currentLocale}
        onChange={(e) => switchLocale(e.target.value)}
        disabled={isPending}
        aria-label={t('language')}
        className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-primary disabled:cursor-wait disabled:opacity-60"
      >
        {LOCALES.map((locale) => (
          <option key={locale.code} value={locale.code}>
            {locale.flag} {t(locale.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}