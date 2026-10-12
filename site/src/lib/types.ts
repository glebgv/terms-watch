export interface SiteDoc {
  doc_id: string
  title: string
  url: string
}

export interface Site {
  id: string
  name: string
  url: string
  category: string
  added: string
  active: boolean
  docs: SiteDoc[]
}

export interface DocMeta {
  id: string
  doc_id: string
  name: string
  doc_title: string
  url: string
  first_check: string
  last_check: string
  total_versions: number
  last_hash: string
}

export interface Version {
  date: string
  hash: string
  wayback_url: string | null
  text_length: number
  notes: string
}

export interface ChangelogEntry {
  date: string
  checked_at: string
  site_id: string
  site_name: string
  doc_id: string
  doc_title: string
  is_major: boolean
  keywords: string[]
  summary: string
  url: string
  diff_path: string | null
}

export interface WordDiffPart {
  type: 'keep' | 'add' | 'remove'
  text: string
}

export interface DiffChange {
  type: 'add' | 'remove' | 'modify'
  position: number
  text?: string
  old_text?: string
  new_text?: string
  word_diff?: WordDiffPart[]
}

export interface DiffStats {
  lines_added: number
  lines_removed: number
  lines_changed: number
  change_ratio: number
}

export interface Diff {
  site: string
  doc_id: string
  doc_title: string
  from_date: string
  to_date: string
  from_hash: string
  to_hash: string
  url: string
  stats: DiffStats
  is_major: boolean
  keywords: string[]
  changes: DiffChange[]
  ai_summary?: string
}

export interface HealthEntry {
  last_success: string | null
  consecutive_errors: number
  last_error: string | null
  days_stale?: number
}

export interface IndexAggregate {
  generated_at: string
  sites: {
    site: Site
    docs: DocMeta[]
    last_change: ChangelogEntry | null
    changes_count: number
  }[]
  changelog: ChangelogEntry[]
}
