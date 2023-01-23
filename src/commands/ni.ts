import { getConfig } from '../config'
import { parseNi } from '../parse'
import { runCli } from '../runner'

runCli(async (agent, args, ctx) => {
  if (args.includes('--config')) {
    const config = await getConfig()
    console.log(JSON.stringify(config, null, 2))

    return ''
  }

  return parseNi(agent, args, ctx)
})
