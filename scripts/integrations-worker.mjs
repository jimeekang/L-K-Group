import { existsSync } from 'node:fs'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')
if (process.env.LOCAL_OPERATIONS_ENABLED !== 'true') {
  process.stderr.write('Local operations are not enabled.\n')
  process.exit(1)
}
const { syncAll } = await import('../src/modules/operations/server-api.ts')
let running = true
let finishSleep = null
const stop = () => { running = false; finishSleep?.() }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
while (running) {
  try {
    const result = await syncAll()
    process.stdout.write(`Integration poll completed: ${JSON.stringify(result)}\n`)
  } catch {
    process.stderr.write('Integration poll failed; retrying later.\n')
  }
  if (process.argv.includes('--once')) break
  if (running) await new Promise((resolve) => {
    const timer = setTimeout(resolve, 60000)
    finishSleep = () => { clearTimeout(timer); resolve() }
  })
  finishSleep = null
}
