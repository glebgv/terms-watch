# Terms Watch — мониторинг оферт для соискателей

Публичная платформа, отслеживающая изменения пользовательских соглашений, оферт
и политик конфиденциальности сайтов для поиска работы (HeadHunter, Habr Career,
LinkedIn, Indeed, SuperJob и др.).

## Что мы публикуем

- ✅ Хэши SHA-256 всех версий (`data/*/versions.json`)
- ✅ Диффы изменений «было → стало» — цитирование в информационных целях (ст. 1274 ГК РФ)
- ✅ Ссылки на Wayback Machine и первоисточники
- ✅ AI-саммари изменений
- ❌ Полные тексты документов — они хранятся только в приватном архиве владельца

## Как пользоваться

- **Витрина**: [GitHub Pages](https://glebgv.github.io/terms-watch/) — таймлайны, диффы, поиск
- **RSS**: [feed.xml](https://glebgv.github.io/terms-watch/feed.xml)
- **Telegram**: [@terms_watch](https://t.me/terms_watch)
- **Для ИИ-агентов**: MCP-сервер в [mcp-server/](mcp-server/) — инструменты
  `list_sites`, `get_changes`, `get_diff`, `search_changes`, `get_summary`

## Данные

Все данные в `data/` в формате JSON, схема — [data/schema.json](data/schema.json).
Лицензия данных: CC BY-SA 4.0. Код: MIT.

## Предложить сайт или сообщить о баге

Откройте [Issue](https://github.com/glebgv/terms-watch/issues) по шаблону
`add-site` или `bug-report`.

## Дисклеймер

Проект публикует только фрагменты изменений в информационных целях.
Полные тексты доступны по ссылкам на первоисточники и Wayback Machine.
Правообладатель может запросить удаление любого фрагмента — см.
[CONTRIBUTING.md](CONTRIBUTING.md).
