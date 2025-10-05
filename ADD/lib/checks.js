// Expo/React Native focused checks.
import { promises as fs } from 'node:fs'
import path from 'node:path'

export async function runChecks(projectRoot) {
  const pkgPath = path.join(projectRoot, 'package.json')
  const tsPath  = path.join(projectRoot, 'tsconfig.json')
  const appJson = path.join(projectRoot, 'app.json')
  const appCfg  = path.join(projectRoot, 'app.config.js')
  const metro   = path.join(projectRoot, 'metro.config.js')

  const res = {
    env: { node: process.version },
    expo: {},
    deps: {},
    files: {},
    rn3D: {},
    warnings: []
  }

  // package.json
  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'))
    res.files.packageJson = true
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }

    // Expo SDK (derived from expo version)
    res.expo.version = deps.expo || null

    // Core deps
    res.deps.react = deps.react || null
    res.deps['react-native'] = deps['react-native'] || null
    res.deps['expo-gl'] = deps['expo-gl'] || null
    res.deps['expo-three'] = deps['expo-three'] || null
    res.deps.three = deps.three || null
    res.deps['three-stdlib'] = deps['three-stdlib'] || null
    res.deps['@react-three/fiber'] = deps['@react-three/fiber'] || null

    if (!deps['expo-gl'] && !deps['@react-three/fiber']) {
      res.warnings.push('No expo-gl/@react-three/fiber found: 3D pipeline not detected.')
    }
  } catch {
    res.warnings.push('package.json not found or unreadable.')
  }

  // app.json / app.config.js
  res.files.appJson = await exists(appJson)
  res.files.appConfigJs = await exists(appCfg)

  // tsconfig
  res.files.tsconfig = await exists(tsPath)

  // metro config
  res.files.metro = await exists(metro)

  // quick scan for GL/Three usage in source
  const glHits = await findImports(projectRoot, ['expo-gl', 'expo-three', 'three'])
  res.rn3D.imports = glHits

  return res
}

async function exists(p) {
  try { await fs.access(p); return true } catch { return false }
}

async function findImports(root, pkgs) {
  // lightweight grep over app/src for import hits
  const out = { files: [], hits: {} }
  for (const p of pkgs) out.hits[p] = 0

  async function scan(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) {
        if (['node_modules', '.git', '.expo', 'android', 'ios'].includes(e.name)) continue
        await scan(full)
      } else if (e.isFile()) {
        if (!/\.(t|j)sx?$/.test(e.name)) continue
        const txt = await fs.readFile(full, 'utf8')
        let matched = false
        for (const p of pkgs) {
          const re = new RegExp(`from\\s+['"]${p}['"]|require\\(['"]${p}['"]\\)`, 'g')
          const count = (txt.match(re) || []).length
          if (count) {
            out.hits[p] += count
            matched = true
          }
        }
        if (matched) out.files.push(path.relative(root, full))
      }
    }
  }

  // prefer scanning app/ and src/ if present
  const targets = []
  for (const d of ['app', 'src']) {
    try {
      const s = await fs.stat(path.join(root, d))
      if (s.isDirectory()) targets.push(path.join(root, d))
    } catch {}
  }
  if (!targets.length) targets.push(root)

  for (const t of targets) await scan(t)
  return out
}
