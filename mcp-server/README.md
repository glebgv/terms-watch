# Terms Watch MCP-сервер

Публичный MCP-сервер для доступа ИИ-агентов к данным Terms Watch
(режим только чтение из `/data`).

## Установка

```bash
pip install -r requirements.txt   # mcp
python server.py
```

## Подключение (Claude Desktop и др.)

```json
{
  "mcpServers": {
    "terms-watch": {
      "command": "python",
      "args": ["/path/to/mcp-server/server.py"],
      "env": { "DATA_DIR": "/path/to/terms-watch/data" }
    }
  }
}
```

## Инструменты

| Tool | Описание |
|------|----------|
| `list_sites()` | список отслеживаемых сайтов |
| `get_changes(site, from_date?, to_date?, doc_id?)` | изменения за период (YYYY-MM-DD) |
| `get_diff(site, date1, date2)` | полный дифф между версиями |
| `search_changes(keyword)` | поиск по всем диффам |
| `get_summary(site, date)` | AI-саммари изменения |

## Локальный режим (только владелец)

Дополнительные инструменты владельца реализуются поверх приватного архива:
`get_full_text(site, date)`, `compare_documents(site, doc_type)`,
`analyze_trend(site, keyword, years)`. В публичный репо не входят.
