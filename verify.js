const fetch = require('node-fetch')
const R = require('ramda')
const tape = require('tape')
const { load } = require('./contract-loader')
const { headersFor, normalise } = require('./headers')

const responseMatches = ({ status, headers }, name, test) => res => {
  test(name, t => {
    t.is(res.status, status, 'status')
    t.deepEqual(headersFor(R.keys(headers))(res.headers.raw()), normalise(headers), 'headers')
    t.end()
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
  return fetch(url, { method, headers, body: request.body })
    .then(responseMatches(contract.response, contract.name, tape))
    .catch(fail(contract.name, tape))
}

module.exports = (path, baseUrl) => {
  const contracts = load(path)
  return R.map(verify(baseUrl), contracts)
}

module.exports.responseMatches = responseMatches
module.exports.fail = fail
