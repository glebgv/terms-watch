# API (JSON-эндпоинты)

Все данные — статические JSON-файлы, доступны по HTTP с GitHub Pages:
`https://glebgv.github.io/terms-watch/<путь>`.

## Точки входа

| Путь | Описание |
|------|----------|
| `/data/sites.json` | список всех сайтов и их документов |
| `/data/{site}/{doc}/meta.json` | метаданные документа: last_check, total_versions, last_hash |
| `/data/{site}/{doc}/versions.json` | все версии: date, hash, wayback_url |
| `/data/{site}/{doc}/diffs/{date}.json` | дифф, зафиксированный в `{date}` |
| `/changelog.json` | агрегированная лента всех изменений (до 200 записей) |
| `/feed.xml` | Atom-фид (последние 50) |

## Пример

```bash
curl -s https://glebgv.github.io/terms-watch/data/hh/offer/versions.json | jq .
```

## MCP

Для ИИ-агентов удобнее MCP-сервер (`mcp-server/server.py`): те же данные,
инструменты `list_sites`, `get_changes(site, from_date, to_date)`,
`get_diff(site, date1, date2)`, `search_changes(keyword)`, `get_summary(site, date)`.
