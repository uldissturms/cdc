const R = require('ramda')

module.exports.headersFor = headerKeys => R.pick(headerKeys)
const coerceArray = R.unless(Array.isArray, R.of)
module.exports.normalise = R.map(coerceArray)
