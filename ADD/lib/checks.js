// Expo / React Native focused checks (lean edition)
import { promises as fs } from 'node:fs'
import path from 'node:path'

export async function runChecks(projectRoot) {
  const res = {
    env: { node: process.version },
    expo: {},
    deps: {},
    files: {},
    rn3D: {},
    warnings: []
  }

  const pkgPath = path.join(projectRoot, 'package.json')
  const tsPath  = path.join(projectRoot, 'tsconfig.json')
  const appJson = path.join(projectRoot, 'app.json')
  const appCfg  = path.join(projectRoot, 'app.config.js')
  const metro   = path.join(projectRoot, 'metro.config.js')

  // --- package.json
  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'))
    res.files.packageJson = true
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }

    res.expo.version = deps.expo || null
    Object.assign(res.deps, {
      react: deps.react || null,
      'react-native': deps['react-native'] || null,
      'expo-gl': deps['expo-gl'] || null,
      'expo-three': deps['expo-three'] || null,
      three: deps.three || null,
      'three-stdlib': deps['three-stdlib'] || null,
      '@react-three/fiber': deps['@react-three/fiber'] || null
    })

    // quick Expo SDK mismatch check
    if (res.expo.version && res.deps['react-native']) {
      const rnMajor = res.deps['react-native'].match(/\d+/)?.[0]
      if (Number(rnMajor) < 80) res.warnings.push('React Native version may be outdated for Expo SDK 54+.')
    }
  } catch {
    res.warnings.push('package.json not found or unreadable.')
  }

  // --- core config files
  res.files.appJson = await exists(appJson)
  res.files.appConfigJs = await exists(appCfg)
  res.files.tsconfig = await exists(tsPath)
  res.files.metro = await exists(metro)
  res.files.appTsx = await exists(path.join(projectRoot, 'App.tsx'))

  // --- 3D imports check
  const glHits = await findImports(projectRoot, ['expo-gl', 'expo-three', 'three'])
  res.rn3D.imports = glHits

  // --- derive 3D readiness
  const ready3D = !!(res.deps['expo-gl'] && res.deps.three)
  if (!ready3D)
    res.warnings.push('3D pipeline not fully ready (need expo-gl + three).')

  // flag unused helpers
  if (res.deps['expo-three'] && glHits.hits['expo-three'] === 0)
    res.warnings.push('expo-three installed but never imported.')
  if (res.deps['three-stdlib'] && glHits.hits['three-stdlib'] === 0)
    res.warnings.push('three-stdlib installed but never imported.')

  // optional tsconfig inspection (strict mode)
  if (res.files.tsconfig) {
    try {
      const tsCfg = JSON.parse(await fs.readFile(tsPath, 'utf8'))
      if (tsCfg.compilerOptions && tsCfg.compilerOptions.strict !== true)
        res.warnings.push('tsconfig strict mode disabled.')
    } catch {}
  }

  return res
}

// --------------------------------------------------------
async function exists(p) {
  try { await fs.access(p); return true } catch { return false }
}

// lightweight recursive search
async function findImports(root, pkgs) {
  const out = { files: [], hits: {} }
  for (const p of pkgs) out.hits[p] = 0

  async function scan(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) {
        if (['node_modules', '.git', '.expo', 'android', 'ios'].includes(e.name)) continue
        await scan(full)
      } else if (e.isFile() && /\.(t|j)sx?$/.test(e.name)) {
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
