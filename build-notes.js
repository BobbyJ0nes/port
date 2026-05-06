#!/usr/bin/env node
/**
 * build-notes.js — build the Quartz wiki and stage it under port_v2/notes/.
 *
 * The wiki content is authored in ../notes_quartz/content/ (Quartz reads it
 * as an Obsidian vault). This script runs Quartz's build, then copies the
 * static output into port_v2/notes/ so the whole site can be served from
 * a single origin (locally and in production).
 *
 * Run from port_v2/:
 *   node build-notes.js
 *
 * Or from anywhere:
 *   node /path/to/port_v2/build-notes.js
 *
 * Cross-platform (Windows + macOS + Linux); requires Node 16+.
 */

const { execSync } = require("node:child_process")
const fs = require("node:fs")
const path = require("node:path")

const PORT_V2 = __dirname
const NOTES_QUARTZ = path.resolve(PORT_V2, "..", "notes_quartz")
const QUARTZ_OUT = path.join(NOTES_QUARTZ, "public")
const NOTES_DEST = path.join(PORT_V2, "notes")

function log(msg) {
  console.log(`[build-notes] ${msg}`)
}

if (!fs.existsSync(NOTES_QUARTZ)) {
  console.error(`[build-notes] notes_quartz not found at: ${NOTES_QUARTZ}`)
  console.error("  expected sibling directory of port_v2.")
  process.exit(1)
}

log(`building Quartz from: ${NOTES_QUARTZ}`)
try {
  execSync("npx quartz build", {
    cwd: NOTES_QUARTZ,
    stdio: "inherit",
    shell: true,
  })
} catch (err) {
  console.error("[build-notes] Quartz build failed.")
  process.exit(err.status ?? 1)
}

if (!fs.existsSync(QUARTZ_OUT)) {
  console.error(`[build-notes] expected build output at: ${QUARTZ_OUT}`)
  process.exit(1)
}

log(`replacing ${NOTES_DEST}`)
fs.rmSync(NOTES_DEST, { recursive: true, force: true })
fs.mkdirSync(NOTES_DEST, { recursive: true })
fs.cpSync(QUARTZ_OUT, NOTES_DEST, { recursive: true })

log(`✓ wiki built and staged at /notes/`)
log(`  serve port_v2 with: python serve.py 5188`)
log(`  open: http://127.0.0.1:5188/notes/animus/`)
