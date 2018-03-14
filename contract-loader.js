const R = require('ramda')
const joi = require('joi')
const path = require('path')
const fs = require('fs')

const setDefault = (path, value) => contract =>
  R.assocPath(
    path,
    R.defaultTo(value, R.path(path, contract)),
    contract)

const setDefaults =
  R.pipe(
    setDefault([ 'request', 'method' ], 'GET'),
    setDefault([ 'request', 'headers' ], {}),
    setDefault([ 'request', 'bodySchema' ], joi.any()),
    setDefault([ 'response', 'status' ], 200),
    setDefault([ 'response', 'headers' ], {}),
    setDefault([ 'response', 'bodySchema' ], joi.any())
  )

const requireUncached = module => {
  delete require.cache[require.resolve(module)]
  return require(module)
}

module.exports.load = path => {
  const loaded = requireUncached(path)
  const contracts = R.unless(Array.isArray, R.of, loaded)
  return R.map(setDefaults, contracts)
}

module.exports.dir = contract =>
  new Promise((resolve, reject) => {
    const fullPath = path.resolve(contract)
    fs.stat(fullPath, (err, stats) => {
      if (err) {
        return resolve(path.dirname(fullPath))
      }

      return stats.isDirectory()
        ? resolve(fullPath)
        : resolve(path.dirname(fullPath))
    })
  })
