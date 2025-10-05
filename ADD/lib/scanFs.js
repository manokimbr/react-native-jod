// Node 22+ (no transpile). Scans project tree with filters.
import { promises as fs } from 'node:fs'
import path from 'node:path'

export async function scanTree(root, cfg) {
  const rootAbs = path.resolve(root)
  return await walk(rootAbs, rootAbs, cfg)
}

async function walk(abs, rootAbs, cfg) {
  const rel = path.relative(rootAbs, abs) || '.'
  const stat = await fs.lstat(abs)

  if (stat.isSymbolicLink()) return null

  if (stat.isDirectory()) {
    const name = path.basename(abs)
    if (cfg.ignore?.some((p) => rel === p || rel.startsWith(`${p}${path.sep}`))) {
      return null
    }
    const dir = await fs.opendir(abs)
    const children = []
    for await (const dirent of dir) {
      const childPath = path.join(abs, dirent.name)
      const child = await walk(childPath, rootAbs, cfg)
      if (child) children.push(child)
    }

    // mark whether this dir is “interesting” (in includeDirs)
    const interesting =
      rel === '.' ? true :
      (cfg.includeDirs?.some(d => rel === d || rel.startsWith(`${d}${path.sep}`)) ?? true)

    return {
      type: 'dir',
      name: path.basename(abs),
      path: rel,
      interesting,
      children
    }
  }

  if (stat.isFile()) {
    const size = stat.size
    const ext = path.extname(abs).slice(1)
    return {
      type: 'file',
      name: path.basename(abs),
      path: rel,
      ext,
      size
    }
  }

  return null
}
