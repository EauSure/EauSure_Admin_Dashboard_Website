'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';

const SUPPORTED_LOCALES = new Set(['fr', 'en', 'ar']);

export function SettingsSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { setTheme, theme: currentTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const hasAppliedLocale = useRef(false);
  const hasAppliedTheme = useRef(false);

  useEffect(() => {
    if (hasAppliedTheme.current) return;
    if (!session?.user) return;

    hasAppliedTheme.current = true;

    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null;
    if (stored) return;

    const preferredTheme = session.user.theme;
    if (preferredTheme && preferredTheme !== currentTheme) {
      setTheme(preferredTheme);
    }
  }, [session, setTheme, currentTheme]);

  useEffect(() => {
    if (hasAppliedLocale.current) return;
    if (!session) return;

    hasAppliedLocale.current = true;
    const preferredLanguage = session.user?.language;
    const segments = pathname.split('/');
    const currentLocale = segments[1];

    if (
      preferredLanguage &&
      SUPPORTED_LOCALES.has(preferredLanguage) &&
      preferredLanguage !== currentLocale
    ) {
      segments[1] = preferredLanguage;
      router.replace(segments.join('/') || `/${preferredLanguage}`);
    }
  }, [pathname, router, session]);

  useEffect(() => {
    if (!session?.user?.id) return;

    let cancelled = false;

    fetch('/api/user/me', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((user) => {
        if (!cancelled && typeof user?.sidebarCollapsed === 'boolean') {
          localStorage.setItem('sidebarCollapsed', String(user.sidebarCollapsed));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return children;
}
