/* Terms Watch — витрина (чистый JS, без фреймворков) */
const DATA = (p) => p; // данные лежат рядом: /data/...

async function j(url) {
  const r = await fetch(url);
  if (!r.ok) return null;
  return r.json();
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function esc(s) {
  return (s ?? "").toString().replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/* ---------- главная страница ---------- */
async function initIndex() {
  const [cl, sites] = await Promise.all([j("/changelog.json"), j("/data/sites.json")]);
  if (!cl) return;

  const entries = cl.entries || [];
  document.getElementById("stat-sites").textContent = sites ? sites.sites.length : "?";
  document.getElementById("stat-changes").textContent = entries.length;
  document.getElementById("stat-updated").textContent =
    (cl.updated || "").replace("T", " ").slice(0, 16) + " UTC";

  const siteSel = document.getElementById("filter-site");
  const byId = {};
  for (const s of (sites?.sites || [])) { byId[s.id] = s; siteSel.add(new Option(s.name, s.id)); }

  // Fuse-индекс по записям ленты (заголовки + саммари + keywords)
  let diffCache = [];
  const fuse = new Fuse(entries, {
    keys: ["site_name", "doc_title", "summary", "keywords"],
    threshold: 0.35, ignoreLocation: true,
  });

  const feed = document.getElementById("feed");
  function render(list) {
    feed.innerHTML = "";
    if (!list.length) { feed.append(el("p", "text-gray-500", "Ничего не найдено")); return; }
    for (const e of list.slice(0, 20)) {
      const card = el("article",
        "bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-blue-700 transition");
      const tags = (e.keywords || []).map(k =>
        `<span class="text-xs bg-blue-900/50 text-blue-300 rounded px-2 py-0.5 mr-1">${esc(k)}</span>`).join("");
      card.innerHTML = `
        <div class="flex justify-between items-start gap-2">
          <a class="text-lg font-semibold hover:underline" href="/site/${e.site_id}.html#${e.date}">
            ${esc(e.site_name)} — ${esc(e.doc_title)}</a>
          <time class="text-sm text-gray-400 shrink-0">${esc(e.date)}</time>
        </div>
        ${e.is_major ? '<div class="text-amber-400 text-sm mt-1">⚠️ документ переписан полностью</div>' : ""}
        <p class="text-gray-300 text-sm mt-2">${esc(e.summary)}</p>
        <div class="mt-2">${tags}</div>
        <div class="mt-2 text-xs text-gray-500 flex gap-3">
          ${e.diff_url ? `<a class="underline" href="${e.diff_url}">diff JSON</a>` : ""}
          <a class="underline" href="${esc(e.url)}">первоисточник</a>
        </div>`;
      feed.append(card);
    }
  }

  function applyFilters() {
    const q = document.getElementById("search").value.trim();
    const s = siteSel.value, k = document.getElementById("filter-kw").value;
    let list = q ? fuse.search(q).map(r => r.item) : entries.slice();
    if (s) list = list.filter(e => e.site_id === s);
    if (k) list = list.filter(e => (e.keywords || []).includes(k));
    render(list);
  }

  document.getElementById("search").addEventListener("input", applyFilters);
  siteSel.addEventListener("change", applyFilters);
  document.getElementById("filter-kw").addEventListener("change", applyFilters);
  render(entries);
}

/* ---------- страница сайта ---------- */
async function initSite(siteId) {
  const feed = document.getElementById("timeline");
  const [cl, sites] = await Promise.all([j("/changelog.json"), j("/data/sites.json")]);
  const site = (sites?.sites || []).find(s => s.id === siteId);
  const entries = (cl?.entries || []).filter(e => e.site_id === siteId);

  if (site) {
    document.getElementById("meta").innerHTML = `
      <p><a class="underline" href="${esc(site.url)}">${esc(site.url)}</a></p>
      <p class="text-sm text-gray-400">добавлен ${esc(site.added)} · документов: ${site.docs.length}</p>`;
    for (const d of site.docs) {
      j(`/data/${siteId}/${d.doc_id}/meta.json`).then(m => {
        if (m) document.getElementById("docmeta").append(el("div", "text-sm",
          `<b>${esc(m.doc_title)}</b>: версий ${m.total_versions}, последняя проверка ${esc((m.last_check || "").slice(0, 16))}`));
      });
    }
  }

  for (const e of entries) {
    const item = el("div", "flex gap-4");
    item.innerHTML = `
      <div class="timeline-dot w-3 h-3 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
      <div class="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div class="flex justify-between">
          <button class="font-semibold hover:underline text-left" data-date="${e.date}" data-doc="${e.doc_id}">
            ${esc(e.doc_title)}</button>
          <time class="text-sm text-gray-400">${esc(e.date)}</time>
        </div>
        <p class="text-sm text-gray-300 mt-1">${esc(e.summary)}</p>
      </div>`;
    feed.prepend(item);
  }
  if (!entries.length) feed.append(el("p", "text-gray-500", "Изменений пока не зафиксировано."));

  feed.addEventListener("click", async (ev) => {
    const btn = ev.target.closest("button[data-date]");
    if (!btn) return;
    openDiff(siteId, btn.dataset.doc, btn.dataset.date);
  });

  // сравнение двух версий
  document.getElementById("btn-compare")?.addEventListener("click", async () => {
    const docId = document.getElementById("cmp-doc").value;
    const d1 = document.getElementById("cmp-1").value;
    const d2 = document.getElementById("cmp-2").value;
    if (!d1 || !d2 || d1 === d2) { alert("Выберите две разные даты"); return; }
    const diff = await j(`/data/${siteId}/${docId}/diffs/${d2}.json`);
    openModal(diff, d1, d2);
  });

  async function openDiff(siteId, docId, date) {
    const diff = await j(`/data/${siteId}/${docId}/diffs/${date}.json`);
    if (!diff) { alert("Дифф недоступен (документ переписан полностью — см. первоисточник)"); return; }
    openModal(diff, diff.from_date, diff.to_date);
  }
}

function openModal(diff, d1, d2) {
  let body;
  if (diff.is_major || !diff.changes?.length) {
    body = el("p", "text-amber-400",
      "Документ переписан полностью. Ключевые темы: " +
      esc((diff.keywords || []).join(", ") || "—") +
      `. <a class="underline" target="_blank" href="${esc(diff.url || "")}">Первоисточник</a>`);
  } else {
    body = el("pre", "text-sm overflow-x-auto");
    for (const c of diff.changes) {
      if (c.type === "add") body.append(el("span", "diff-add", `<span class="diff-pos">${c.position}</span>+ ${esc(c.text)}`));
      else if (c.type === "remove") body.append(el("span", "diff-remove", `<span class="diff-pos">${c.position}</span>- ${esc(c.text)}`));
      else {
        const wd = (c.word_diff || []).map(w =>
          `<span class="wd-${w.type}">${esc(w.text)}</span>`).join(" ");
        body.append(el("span", "diff-modify", `<span class="diff-pos">${c.position}</span>~ ${wd}`));
      }
      body.append("\n");
    }
  }
  const overlay = el("div", "fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4");
  const box = el("div", "bg-gray-900 border border-gray-700 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-auto p-6");
  box.append(el("h3", "text-lg font-bold mb-2",
    `${esc(diff.doc_title || "")}: ${esc(d1)} → ${esc(d2)}`));
  const st = diff.stats || {};
  box.append(el("p", "text-xs text-gray-400 mb-3",
    `+${st.lines_added} / -${st.lines_removed} / ~${st.lines_changed}`));
  if (diff.ai_summary) box.append(el("p", "text-gray-300 text-sm mb-3", esc(diff.ai_summary)));
  box.append(body);
  const close = el("button", "mt-4 px-3 py-1 bg-gray-800 rounded hover:bg-gray-700", "Закрыть");
  close.onclick = () => overlay.remove();
  box.append(close);
  overlay.append(box);
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.body.append(overlay);
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "index") initIndex();
  else if (document.body.dataset.page === "site") initSite(document.body.dataset.site);
});
