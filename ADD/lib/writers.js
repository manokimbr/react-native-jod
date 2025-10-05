import { promises as fs } from 'node:fs'
import path from 'node:path'
import { toPrettyTree } from './treeText.js'

export async function writeOutputs(memoryDir, tree, checks) {
  await fs.mkdir(memoryDir, { recursive: true })

  const structure = {
    generatedAt: new Date().toISOString(),
    summary: summarize(tree),
    checks,
    tree
  }

  const jsonPath = path.join(memoryDir, 'structure.json')
  await fs.writeFile(jsonPath, JSON.stringify(structure, null, 2), 'utf8')

  const txtPath = path.join(memoryDir, 'structure.txt')
  const txt = [
    '# Project Structure (React Native / Expo – ADD)',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Checks',
    `- Node: ${checks.env?.node ?? 'unknown'}`,
    `- Expo (dependency): ${checks.expo?.version ?? 'not found'}`,
    `- RN: ${checks.deps?.['react-native'] ?? 'not found'}`,
    `- three: ${checks.deps?.three ?? 'not found'}`,
    `- expo-gl: ${checks.deps?.['expo-gl'] ?? 'not found'}`,
    `- expo-three: ${checks.deps?.['expo-three'] ?? 'not found'}`,
    `- @react-three/fiber: ${checks.deps?.['@react-three/fiber'] ?? 'not found'}`,
    `- app.json: ${checks.files?.appJson ? 'yes' : 'no'}`,
    `- app.config.js: ${checks.files?.appConfigJs ? 'yes' : 'no'}`,
    `- tsconfig.json: ${checks.files?.tsconfig ? 'yes' : 'no'}`,
    `- metro.config.js: ${checks.files?.metro ? 'yes' : 'no'}`,
    '',
    '### 3D Import Hits',
    `files: ${checks.rn3D?.imports?.files?.length ?? 0}`,
    ...Object.entries(checks.rn3D?.imports?.hits || {}).map(([k, v]) => `- ${k}: ${v}`),
    '',
    '### Warnings',
    ...(checks.warnings?.length ? checks.warnings.map(w => `- ⚠️ ${w}`) : ['- none']),
    '',
    '## Tree',
    toPrettyTree(tree)
  ].join('\n')

  await fs.writeFile(txtPath, txt, 'utf8')

  return { jsonPath, txtPath }
}

function summarize(node) {
  const out = { files: 0, dirs: 0, sizeBytes: 0 }
  walk(node, (n) => {
    if (n.type === 'file') {
      out.files += 1
      out.sizeBytes += n.size || 0
    } else if (n.type === 'dir') {
      out.dirs += 1
    }
  })
  return out
}

function walk(node, fn) {
  fn(node)
  if (node.children) node.children.forEach((c) => walk(c, fn))
}
