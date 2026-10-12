import type {
  ChangelogEntry, Diff, HealthEntry, IndexAggregate, Site, Version,
} from './types'

// база: на GitHub Pages — /terms-watch/, локально — '/'
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/data'

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}/${path}`)
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`)
  return r.json()
}

export const api = {
  index: () => get<IndexAggregate>('index.json'),
  sites: () => get<{ sites: Site[] }>('sites.json'),
  changelog: () => get<{ updated: string; entries: ChangelogEntry[] }>('changelog.json'),
  versions: (siteId: string, docId: string) =>
    get<{ versions: Version[] }>(`${siteId}/${docId}/versions.json`),
  diff: (siteId: string, docId: string, date: string) =>
    get<Diff>(`${siteId}/${docId}/diffs/${date}.json`),
  health: () => get<Record<string, HealthEntry>>('health.json'),
}

export async function versionsAll(siteId: string) {
  const idx = await api.index()
  const agg = idx.sites.find((s) => s.site.id === siteId)
  if (!agg) throw new Error('сайт не найден')
  const versions: Record<string, Version[]> = {}
  await Promise.all(
    agg.docs.map(async (m) => {
      try {
        versions[m.doc_id] = (await api.versions(siteId, m.doc_id)).versions
      } catch {
        versions[m.doc_id] = []
      }
    }),
  )
  const changelog = idx.changelog.filter((c) => c.site_id === siteId)
  return { agg, versions, changelog }
}
