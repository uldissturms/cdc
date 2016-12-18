const R = require('ramda')

module.exports.headersFor = headerKeys => R.pick(headerKeys)
const coerceArray = R.unless(R.isArrayLike, R.of)
module.exports.normalise = R.map(coerceArray)
