/* eslint-disable no-console */

import c from 'kleur'
import { getScriptsConfig } from '../fs'
import { runCli } from '../runner'

runCli((agent, _args, ctx) => {
  const { scripts, scriptsInfo } = getScriptsConfig(agent, ctx?.cwd)
  const names = Object.entries(scripts) as [string, string][]

  console.log(c.underline('Available scripts:'))

  if (!names.length) {
    console.log(c.red('No scripts found'))
    return
  }

  const raw = names
    .filter(i => !i[0].startsWith('?'))
    .map(([key, cmd]) => ({
      key,
      cmd,
      description: scriptsInfo[key] || scripts[`?${key}`] || cmd,
    }))

  const terminalColumns = process.stdout?.columns || 80
  function limitText(text: string, maxWidth: number) {
    if (text.length <= maxWidth)
      return text

    return `${text.slice(0, maxWidth)}${c.dim('…')}`
  }

  const listOfScripts = raw.map(item => ({ ...item, description: limitText(item.description, terminalColumns - 15) }))

  for (const script of listOfScripts)
    console.log(`${c.blue(script.key)} - ${script.description}`)

  return undefined
})
