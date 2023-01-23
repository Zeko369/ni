import fs from 'fs'
import path from 'path'
import ini from 'ini'
import { findUp } from 'find-up'
import type { Agent } from './agents'
import { LOCKS } from './agents'

const customRcPath = process.env.NI_CONFIG_FILE

const home = process.platform === 'win32'
  ? process.env.USERPROFILE
  : process.env.HOME

const defaultRcPath = path.join(home || '~/', '.nirc')

const rcPath = customRcPath || defaultRcPath

interface Config {
  defaultAgent: Agent | 'prompt'
  globalAgent: Agent
}

const defaultConfig: Config = {
  defaultAgent: 'prompt',
  globalAgent: 'npm',
}

let config: Config | undefined
let loadedFrom: 'pkg' | 'rc' | 'default' | 'none' = 'none'

export async function getConfig() {
  if (!config) {
    const result = (await findUp('package.json')) || ''
    let packageManager = ''
    if (result)
      packageManager = JSON.parse(fs.readFileSync(result, 'utf8')).packageManager ?? ''

    const [, agent, version] = packageManager.match(new RegExp(`^(${Object.values(LOCKS).join('|')})@(\d).*?$`)) || []
    if (agent) {
      config = Object.assign({}, defaultConfig, {
        defaultAgent: agent === 'yarn' && parseInt(version) > 1 ? 'yarn@berry' : agent,
      })
      loadedFrom = 'pkg'
    }
    else if (!fs.existsSync(rcPath)) {
      config = defaultConfig
      loadedFrom = 'default'
    }
    else {
      config = Object.assign({}, defaultConfig, ini.parse(fs.readFileSync(rcPath, 'utf-8')))
      loadedFrom = 'rc'
    }
  }

  return [config, loadedFrom] as const
}

export async function getDefaultAgent() {
  const [{ defaultAgent }] = await getConfig()
  if (defaultAgent === 'prompt' && process.env.CI)
    return 'npm'
  return defaultAgent
}

export async function getGlobalAgent() {
  const [{ globalAgent }] = await getConfig()
  return globalAgent
}
