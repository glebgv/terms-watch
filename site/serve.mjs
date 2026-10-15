// Terms Watch — локальный сервер витрины
// раздаёт site-dist/ и /data -> ../monitor/data-public
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const PORT = Number(process.env.PORT || 8765)
const DIST = join(import.meta.dirname, 'dist')
const DATA = join(import.meta.dirname, '..', 'monitor', 'data-public')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

createServer(async (req, res) => {
  try {
    let url = decodeURIComponent((req.url || '/').split('?')[0])
    let base = DIST, path = url

    if (url.startsWith('/data/')) {
      base = DATA
      path = url.slice(5) // '/data/...' -> '/...'
    }

    let file = normalize(join(base, path))
    if (!file.startsWith(base)) { res.writeHead(403).end(); return }

    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
    } catch {
      if (base === DIST) file = join(DIST, 'index.html') // SPA fallback
    }

    const body = await readFile(file)
    res.writeHead(200, {
      'Content-Type': MIME[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    })
    res.end(body)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('404')
  }
}).listen(PORT, () => {
  console.log(`terms-watch: http://localhost:${PORT}  (данные: ${DATA})`)
})
