import test from 'ava'
import tape from 'blue-tape'
import nock from 'nock'
import concat from 'concat-stream'
import joi from 'joi'
import verify, { responseMatches, fail } from './verify'

const baseUrl = 'http://provider:4000'
const emptyHeaders = { raw: () => ({}) }

const defaultExpectations = {
  status: 200,
  headers: {},
  bodySchema: joi.object()
}
const defaultReturns = {
  headers: emptyHeaders,
  body: null
}
const expect = overrides =>
  Object.assign({}, defaultExpectations, overrides)
const returns = overrides =>
  Object.assign({}, defaultReturns, overrides)

const matchingContractFor = (t, name, response) => {
  stubProvider(name, response)
  contractMatchesFor(name, t)
}

const contractFor = name =>
  `./contracts/${name}`

test.cb(
  'verifies simple response contract',
  matchingContractFor,
  'simple'
)

test.cb(
  'verifies simple response header contract',
  matchingContractFor,
  'simple-header',
  { headers: { 'x-request-id': '12345' } }
)

test.cb(
  'verifies simple response body contract',
  matchingContractFor,
  'simple-schema',
  { method: 'POST', body: { id: 1 } }
)

test.cb('reports response status mismatch', t => {
  const expected = expect({ status: 200 })
  const actual = returns({ status: 404 })

  outputFor(expected, actual, output => {
    t.regex(output, /expected: 200/)
    t.regex(output, /actual: {3}404/)
    t.end()
  })
})

test.cb('reports response header mismatch', t => {
  const expected = expect({ headers: { 'content-type': 'application/json' } })
  const actual = returns({ headers: { raw: () => ({ 'content-type': [ 'text/xml' ] }) } })

  outputFor(expected, actual, output => {
    t.regex(output, /expected:/)
    t.regex(output, /application\/json/)
    t.regex(output, /actual:/)
    t.regex(output, /text\/xml/)
    t.end()
  })
})

test.cb('reports response body mismatch', t => {
  const expected = expect({ bodySchema: joi.object().keys({ id: joi.number().integer() }) })
  const actual = returns({ body: {}, json: () => Promise.resolve({ id: 'string' }) })

  outputFor(expected, actual, output => {
    t.regex(output, /"id" must be a number/)
    t.end()
  })
})

test.cb('reports test failure for errors', t => {
  const message = 'error message'
  fail('test name', testStreamFor(output => {
    t.regex(output, /error message/)
    t.end()
  }))({ message })
})

function stubProvider (name, { method = 'GET', status = 200, body = { hello: 'world' }, headers } = {}) {
  nock(baseUrl)
    .intercept(`/api/${name}`, method)
    .reply(status, body, headers)
}

function contractMatchesFor (name, t) {
  Promise.all(verify(contractFor(name), baseUrl))
    .then(() => { t.end() })
    .catch(t.end)
}

function outputFor (expected, actual, output) {
  responseMatches(expected, 'test name', testStreamFor(output))(actual)
}

function testStreamFor (output) {
  const test = tape.createHarness()
  test.createStream().pipe(concat(output))
  return test
}
