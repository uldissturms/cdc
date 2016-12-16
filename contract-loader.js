const R = require('ramda')
const joi = require('joi')

const setDefault = (path, value) => contract =>
  R.assocPath(
    path,
    R.defaultTo(value, R.path(path, contract)),
    contract)

const setDefaults =
  R.pipe(
    setDefault([ 'request', 'headers' ], {}),
    setDefault([ 'request', 'bodySchema' ], joi.object()),
    setDefault([ 'response', 'status' ], 200)
  )

const requireUncached = module => {
  delete require.cache[require.resolve(module)]
  return require(module)
}

module.exports.load = contract => {
  const loaded = requireUncached(contract)
  return [setDefaults(loaded)]
}