const consola = require('consola')
const crossSpawn = require('cross-spawn')
const http = require("http")

const REQUET_TIMEOUT = 1000

const spawn = (command) => {
  const [c, ...args] = command.split(' ')
  console.log(c)
  console.log(args)
  return crossSpawn(c, args)
}

const checkBackendConnection = () => {
  return new Promise((resolve, reject) => {
    const helthCheckURL = 'http://localhost:4000'
    const req = http
      .get(helthCheckURL, resolve)
      .on('error', reject);
    req.setTimeout(REQUET_TIMEOUT)
    req.on('timeout', () => {
      req.destroy()
    })
  })
}

const checkFrontendConnection = () => {
  return new Promise((resolve, reject) => {
    const helthCheckURL = 'http://localhost:4001'
    const req = http
      .get(helthCheckURL, resolve)
      .on('error', reject);
    req.setTimeout(REQUET_TIMEOUT)
    req.on('timeout', () => {
      req.destroy()
    })
  })
}

const checkConnection = async () => {
  return Promise.allSettled([checkBackendConnection, checkFrontendConnection])
}

const runE2E = () => {
  const command = 'yarn test'
  const e2e = spawn(command)
  e2e.stdout.on('data', (data) => {
    consola.log(`${data}`)
  })
  e2e.stderr.on('data', (data) => {
    consola.error(`${data}`)
  })
  e2e.on('close', (code) => {
    process.exit(code)
  })
}

const main = () => {
  const LIMIT = 5;
  let retryCount = 0;

  const run = async () => {
    try {
      const promises = await checkConnection()
      const failed = promises.some(p => p.status === 'rejected')

      if (failed) {
        consola.log(JSON.stringify(promises))
        throw new Error('failed')
      }

      runE2E()
    } catch (error) {
      retryCount +=1;
      if (retryCount > LIMIT) {
        consola.error(error)
        process.exit(1)
      }

      const retryInterval = 1000
      setTimeout(run, retryInterval)
    }
    
  }
  run()
}

main()
