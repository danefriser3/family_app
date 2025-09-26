#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

if (process.argv.length < 5) {
  console.error('Usage: node scripts/merge-lcov.mjs <unit-lcov> <e2e-lcov> <out-lcov>')
  process.exit(1)
}

const [unitPath, e2ePath, outPath] = process.argv.slice(2)

function parseLcov(content) {
  const files = new Map() // filePath -> Map<line, hits>
  let currentFile = null
  const lines = content.split(/\r?\n/)
  for (const line of lines) {
    if (line.startsWith('SF:')) {
      currentFile = line.slice(3).trim()
      if (!files.has(currentFile)) files.set(currentFile, new Map())
    } else if (line.startsWith('DA:') && currentFile) {
      const [lnStr, hitsStr] = line.slice(3).split(',')
      const ln = Number(lnStr)
      const hits = Number(hitsStr)
      const m = files.get(currentFile)
      const prev = m.get(ln) || 0
      m.set(ln, Math.max(prev, hits))
    } else if (line === 'end_of_record') {
      currentFile = null
    }
  }
  return files
}

function mergeMaps(a, b) {
  const out = new Map(a)
  for (const [file, mapB] of b.entries()) {
    const mapA = out.get(file) || new Map()
    for (const [ln, hitsB] of mapB.entries()) {
      const hitsA = mapA.get(ln) || 0
      mapA.set(ln, Math.max(hitsA, hitsB))
    }
    out.set(file, mapA)
  }
  return out
}

const unitContent = fs.existsSync(unitPath) ? fs.readFileSync(unitPath, 'utf8') : ''
const e2eContent = fs.existsSync(e2ePath) ? fs.readFileSync(e2ePath, 'utf8') : ''

const unitMap = parseLcov(unitContent)
const e2eMap = parseLcov(e2eContent)
const merged = mergeMaps(unitMap, e2eMap)

let totalLF = 0
let totalLH = 0
let out = ''
for (const [file, linesMap] of merged.entries()) {
  const entries = Array.from(linesMap.entries()).sort((a, b) => a[0] - b[0])
  const lf = entries.length
  const lh = entries.reduce((acc, [, hits]) => acc + (hits > 0 ? 1 : 0), 0)
  totalLF += lf
  totalLH += lh
  out += `SF:${file}\n`
  for (const [ln, hits] of entries) {
    out += `DA:${ln},${hits}\n`
  }
  out += `LF:${lf}\n`
  out += `LH:${lh}\n`
  out += `end_of_record\n`
}

const outDir = path.dirname(outPath)
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(outPath, out, 'utf8')

const pct = totalLF === 0 ? 0 : (totalLH / totalLF) * 100
console.log(`Merged coverage written to ${outPath}`)
console.log(`Lines: ${totalLH}/${totalLF} (${pct.toFixed(2)}%) across ${merged.size} files`)
