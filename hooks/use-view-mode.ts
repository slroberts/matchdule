'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Tab + season live in the URL:
 *   /                              → Schedule
 *   /?view=season                  → Season tab, newest season
 *   /?view=season&season=spring-2026 → Season tab, that season
 * Switching uses history.pushState, which Next's useSearchParams follows:
 *   → back/forward work, links are shareable, and NO server round-trip (no data refetch).
 * Other params (e.g. ?date=) are preserved.
 */

export type ViewMode = 'schedule' | 'season';

type Params = { toString(): string };

/** "Spring 2026" ⇄ "spring-2026" */
export const seasonSlug = (season: string) =>
  season.toLowerCase().replace(/\s+/g, '-');
export const seasonFromSlug = (slug: string) => {
  const [term, year] = slug.split('-');
  return term && year
    ? `${term.charAt(0).toUpperCase()}${term.slice(1)} ${year}`
    : null;
};

export const viewHref = (
  params: Params,
  view: ViewMode,
  season?: string | null,
) => {
  const next = new URLSearchParams(params.toString());
  if (view === 'season') {
    next.set('view', 'season');
    if (season) next.set('season', seasonSlug(season));
    else next.delete('season');
  } else {
    next.delete('view');
    next.delete('season');
  }
  const query = next.toString();
  return query ? `/?${query}` : '/';
};

export const useViewMode = () => {
  const params = useSearchParams();
  const view: ViewMode =
    params.get('view') === 'season' ? 'season' : 'schedule';
  const slug = params.get('season');
  const season = slug ? seasonFromSlug(slug) : null;

  const go = (nextView: ViewMode, nextSeason?: string | null) => {
    if (nextView === view && (nextSeason ?? null) === season) return;
    window.history.pushState(null, '', viewHref(params, nextView, nextSeason));
    window.scrollTo({ top: 0 });
  };

  return {
    view,
    /** Selected season label ("Spring 2026"), or null = newest */
    season,
    go,
    hrefFor: (v: ViewMode, s?: string | null) => viewHref(params, v, s),
  };
};
