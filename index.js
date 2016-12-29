#! /usr/bin/env node

const program = require('commander')
const path = require('path')
const pkg = require('./package')
const mock = require('./mock')
const verify = require('./verify')
const fs = require('fs')

const server = (contract, options) =>
  mock(path.resolve(contract), options.port || 3000)

// TODO: refactor this to functional code - so that server doesn't get mutated
const watch = (contract, options) => {
  const contractDir = path.resolve(contract)
  console.log(`watching for contract changes: ${contractDir}`)

  let srv = server(contract, options)
  fs.watch(contractDir, {recursive: true}, (_, filename) => {
    console.log(`${filename} changed, restarting...`)
    srv.stop(() => {
      srv = server(contract, options)
    })
  })
}

const mockServer = (contract, options) => {
  if (options.watch) {
    return watch(contract, options)
  }

  server(contract, options)
}

program
  .version(pkg.version)

program
  .command('mock [contract]')
  .option('-p, --port <port>', 'Port for running mock server. Defaults to 3000.')
  .option('-w, --watch', 'Watch for changes.')
  .description('Provide mock responses for matching consumer requests.')
  .action((contract = './contracts', options) => {
    mockServer(contract, options)
  })

program
  .command('verify [contract]')
  .option('-b, --baseUrl <port>', 'Base url to run verifications against.')
  .description('Verify contracts against provider.')
  .action((contract = './contracts', options) => {
    verify(contract, options.baseUrl)
  })

program.parse(process.argv)

if (program.args.length === 0) {
  program.help()
}
