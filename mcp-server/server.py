"""Terms Watch MCP-сервер (публичный режим).

Инструменты: list_sites, get_changes, get_diff, search_changes, get_summary.
DATA_DIR по умолчанию — ../data внутри репо (или env DATA_DIR).
Запуск: python server.py  (stdio-транспорт для Claude Desktop и др.)
Требует mcp>=2.0 (from mcp.server.mcpserver import MCPServer).
"""
from __future__ import annotations

import glob
import json
import os
from pathlib import Path

from mcp.server.mcpserver import MCPServer

DATA_DIR = Path(os.getenv("DATA_DIR", Path(__file__).resolve().parent.parent / "data"))
server = MCPServer("terms-watch")


def _read(path: Path, default=None):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def _text(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=2)


def _diff_files(site: str, doc_id: str | None = None) -> list[Path]:
    pattern = f"{site}/{doc_id}/diffs/*.json" if doc_id else f"{site}/*/diffs/*.json"
    return sorted(glob.glob(str(DATA_DIR / pattern)))


@server.tool()
def list_sites() -> str:
    """Возвращает список отслеживаемых сайтов и их документов."""
    data = _read(DATA_DIR / "sites.json", {"sites": []})
    return _text(data["sites"])


@server.tool()
def get_changes(site: str, from_date: str = "0000-01-01",
                to_date: str = "9999-12-31", doc_id: str = "") -> str:
    """Изменения сайта за период (даты YYYY-MM-DD, опционально doc_id)."""
    out = []
    for f in _diff_files(site, doc_id or None):
        d = _read(Path(f))
        if d and from_date <= d.get("to_date", "") <= to_date:
            out.append({k: d.get(k) for k in
                        ("site", "doc_id", "doc_title", "from_date", "to_date",
                         "stats", "is_major", "keywords", "ai_summary", "url")})
    return _text(out)


@server.tool()
def get_diff(site: str, date1: str, date2: str) -> str:
    """Полный дифф между двумя версиями (date1 < date2, YYYY-MM-DD)."""
    for f in _diff_files(site):
        d = _read(Path(f))
        if d and d.get("from_date") == date1 and d.get("to_date") == date2:
            return _text(d)
    return f"не найдено: {site} {date1}->{date2}"


@server.tool()
def search_changes(keyword: str) -> str:
    """Поиск изменений по ключевому слову во всех диффах."""
    kw = keyword.lower()
    out = []
    for f in _diff_files("*"):
        d = _read(Path(f))
        if not d:
            continue
        if kw in json.dumps(d, ensure_ascii=False).lower():
            out.append({k: d.get(k) for k in
                        ("site", "doc_id", "to_date", "is_major", "keywords",
                         "ai_summary")})
    return _text(out)


@server.tool()
def get_summary(site: str, date: str) -> str:
    """AI-саммари изменения сайта за конкретную дату."""
    for f in _diff_files(site):
        d = _read(Path(f))
        if d and d.get("to_date") == date:
            return d.get("ai_summary", "нет саммари")
    return f"не найдено изменение {site} на {date}"


if __name__ == "__main__":
    import asyncio
    asyncio.run(server.run_stdio_async())
