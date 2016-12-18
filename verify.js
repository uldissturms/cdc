const fetch = require('node-fetch')
const R = require('ramda')
const tape = require('blue-tape')

const { load } = require('./contract-loader')
const { headersFor, normalise } = require('./headers')
const { joiOptions } = require('./options')

const validateStatus = (t, status) => responseStatus =>
  t.is(responseStatus, status, 'status')
const validateHeaders = (t, headers) => responseHeaders =>
  t.deepEqual(headersFor(R.keys(headers))(responseHeaders), normalise(headers), 'headers')
const shouldValidateResponseBody =
  R.complement(R.isNil)
const validateResponseBody = (t, bodySchema) => body => {
  t.error(bodySchema.validate(body, joiOptions).error, 'body')
}

const responseMatches = ({ status, headers, bodySchema }, name, test) => res => {
  test(name, t => {
    validateStatus(t, status)(res.status)
    validateHeaders(t, headers)(res.headers.raw())
    return shouldValidateResponseBody(res.body)
      ? res.json().then(validateResponseBody(t, bodySchema))
      : t.end()
  })
}

const fail = (name, test) => err =>
  test(name, t => {
    t.end(err)
  })

const verify = baseUrl => contract => {
  const { request } = contract
  const { path, headers, method } = request
  const url = `${baseUrl}${path}`
  return fetch(url, { method, headers, body: JSON.stringify(request.body) })
    .then(responseMatches(contract.response, contract.name, tape))
    .catch(fail(contract.name, tape))
}

module.exports = (path, baseUrl) => {
  const contracts = load(path)
  return R.map(verify(baseUrl), contracts)
}

module.exports.responseMatches = responseMatches
module.exports.fail = fail
