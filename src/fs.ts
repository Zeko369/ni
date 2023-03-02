import fs from 'node:fs'
import { resolve } from 'node:path'
import type { Agent } from './agents'

const getJSONConfigFile = (cwd: string, filename: string) => {
  const path = resolve(cwd, filename)

  if (fs.existsSync(path)) {
    try {
      const raw = fs.readFileSync(path, 'utf-8')
      const data = JSON.parse(raw) as Record<string, any>
      return data
    }
    catch (e) {
      console.warn(`Failed to parse ${filename}`)
      process.exit(0)
    }
  }
}

export function getPackageJSON(cwd = process.cwd()) {
  return getJSONConfigFile(cwd, 'package.json') || {}
}

export function getDenoJSON(cwd = process.cwd()) {
  return getJSONConfigFile(cwd, 'deno.json') || getJSONConfigFile(cwd, 'deno.jsonc') || {}
}

// support https://www.npmjs.com/package/npm-scripts-info conventions
export function getScriptsConfig(agent: Agent, cwd = process.cwd()): { scripts: Record<string, string>; scriptsInfo: Record<string, string> } {
  if (agent === 'deno') {
    const denoJSON = getDenoJSON(cwd)
    return {
      scripts: denoJSON.tasks || {},
      scriptsInfo: denoJSON['tasks-info'] || {},
    }
  }

  const pkg = getPackageJSON(cwd)
  return {
    scripts: pkg.scripts || {},
    scriptsInfo: pkg['scripts-info'] || {},
  }
}
