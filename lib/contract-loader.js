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

module.exports.load = contract => {
  const loaded = require(contract)
  return [setDefaults(loaded)]
}
