#! /usr/bin/env node

const program = require('commander')
const path = require('path')
const pkg = require('./package')
const mock = require('./mock')

program
  .version(pkg.version)
  .command('mock [contract]')
  .option('-p, --port <port>', 'Port for running mock server. Defaults to 3000.')
  .description('Provide mock responses for matching consumer requests.')
  .action((contract = './contracts', options) => {
    mock(path.resolve(contract), options.port || 3000)
  })

program.parse(process.argv)

if (program.args.length === 0) {
  program.help()
}
