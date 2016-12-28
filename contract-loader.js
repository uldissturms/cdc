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
  const contracts = R.unless(R.isArrayLike, R.of, loaded)
  return R.map(setDefaults, contracts)
}
