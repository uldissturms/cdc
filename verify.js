const fetch = require('node-fetch')
const R = require('ramda')
const tape = require('tape')
const { load } = require('./contract-loader')

const responseMatches = ({ status }, name, test) => res => {
  test(name, t => {
    t.is(res.status, status, 'status')
    t.end()
  })
}

const verify = baseUrl => contract => {
  const { request } = contract
  const { path, method } = request
  const url = `${baseUrl}${path}`
  return fetch(url, { method, body: request.body })
    .then(responseMatches(contract.response, contract.name, tape))
}

module.exports.check = (path, baseUrl) => {
  const contracts = load(path)
  return R.map(verify(baseUrl), contracts)
}

module.exports.responseMatches = responseMatches