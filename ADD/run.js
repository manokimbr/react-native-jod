#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanTree } from './lib/scanFs.js'
import { runChecks } from './lib/checks.js'
import { writeOutputs } from './lib/writers.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..') // repo root
const cfg = JSON.parse(await fs.readFile(path.join(__dirname, 'add.config.json'), 'utf8'))

const tree = await scanTree(projectRoot, cfg)
const checks = await runChecks(projectRoot)
const memoryDir = path.resolve(projectRoot, cfg.memoryDir || './memory')
const { jsonPath, txtPath } = await writeOutputs(memoryDir, tree, checks)

console.log('ADD scan complete.')
console.log(' ->', path.relative(projectRoot, jsonPath))
console.log(' ->', path.relative(projectRoot, txtPath))
