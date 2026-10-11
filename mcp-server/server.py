"""Terms Watch MCP-сервер (публичный режим).

Инструменты: list_sites, get_changes, get_diff, search_changes, get_summary.
DATA_DIR по умолчанию — ../data внутри репо (или env DATA_DIR).
Запуск: python server.py  (stdio-транспорт для Claude Desktop и др.)
"""
from __future__ import annotations

import glob
import json
import os
from pathlib import Path

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

DATA_DIR = Path(os.getenv("DATA_DIR", Path(__file__).resolve().parent.parent / "data"))
server = Server("terms-watch")


def _read(path: Path, default=None):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def _text(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=2)


TOOLS = [
    Tool(name="list_sites",
         description="Возвращает список отслеживаемых сайтов и их документов",
         inputSchema={"type": "object", "properties": {}}),
    Tool(name="get_changes",
         description="Изменения сайта за период (даты YYYY-MM-DD, опционально doc_id)",
         inputSchema={"type": "object", "properties": {
             "site": {"type": "string"},
             "from_date": {"type": "string"},
             "to_date": {"type": "string"},
             "doc_id": {"type": "string"}},
             "required": ["site"]}),
    Tool(name="get_diff",
         description="Полный дифф между двумя версиями (site, date1<date2)",
         inputSchema={"type": "object", "properties": {
             "site": {"type": "string"},
             "date1": {"type": "string"},
             "date2": {"type": "string"}},
             "required": ["site", "date1", "date2"]}),
    Tool(name="search_changes",
         description="Поиск изменений по ключевому слову во всех диффах",
         inputSchema={"type": "object", "properties": {
             "keyword": {"type": "string"}},
             "required": ["keyword"]}),
    Tool(name="get_summary",
         description="AI-саммари изменения сайта за конкретную дату",
         inputSchema={"type": "object", "properties": {
             "site": {"type": "string"},
             "date": {"type": "string"}},
             "required": ["site", "date"]}),
]


def _diff_files(site: str, doc_id: str | None = None) -> list[Path]:
    pattern = f"{site}/{doc_id}/diffs/*.json" if doc_id else f"{site}/*/diffs/*.json"
    return sorted(glob.glob(str(DATA_DIR / pattern)))


@server.list_tools()
async def list_tools() -> list[Tool]:
    return TOOLS


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "list_sites":
        data = _read(DATA_DIR / "sites.json", {"sites": []})
        return [TextContent(type="text", text=_text(data["sites"]))]

    if name == "get_changes":
        site = arguments["site"]
        frm = arguments.get("from_date", "0000-01-01")
        to = arguments.get("to_date", "9999-12-31")
        out = []
        for f in _diff_files(site, arguments.get("doc_id")):
            d = _read(Path(f))
            if d and frm <= d.get("to_date", "") <= to:
                out.append({k: d.get(k) for k in
                            ("site", "doc_id", "doc_title", "from_date", "to_date",
                             "stats", "is_major", "keywords", "ai_summary", "url")})
        return [TextContent(type="text", text=_text(out))]

    if name == "get_diff":
        site, d1, d2 = arguments["site"], arguments["date1"], arguments["date2"]
        for f in _diff_files(site):
            d = _read(Path(f))
            if d and d.get("from_date") == d1 and d.get("to_date") == d2:
                return [TextContent(type="text", text=_text(d))]
        return [TextContent(type="text", text=f"не найдено: {site} {d1}->{d2}")]

    if name == "search_changes":
        kw = arguments["keyword"].lower()
        out = []
        for f in _diff_files("*"):
            d = _read(Path(f))
            if not d:
                continue
            hay = json.dumps(d, ensure_ascii=False).lower()
            if kw in hay:
                out.append({k: d.get(k) for k in
                            ("site", "doc_id", "to_date", "is_major", "keywords",
                             "ai_summary")})
        return [TextContent(type="text", text=_text(out))]

    if name == "get_summary":
        site, date = arguments["site"], arguments["date"]
        for f in _diff_files(site):
            d = _read(Path(f))
            if d and d.get("to_date") == date:
                return [TextContent(type="text", text=d.get("ai_summary", "нет саммари"))]
        return [TextContent(type="text", text=f"не найдено изменение {site} на {date}")]

    raise ValueError(f"unknown tool: {name}")


async def main() -> None:
    async with stdio_server() as (read, write):
        await server.run(read, write, server.create_initialization_options())


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
