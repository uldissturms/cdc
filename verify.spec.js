import test from 'ava'
import tape from 'tape'
import nock from 'nock'
import concat from 'concat-stream'
import verify, { responseMatches, fail } from './verify'

const baseUrl = 'http://provider:4000'
const emptyHeaders = { raw: () => ({}) }
const contractFor = name =>
  `./contracts/${name}`

test.cb('verifies simple contract with base url set', t => {
  stubProvider('simple')
  contractMatchesFor('simple', t)
})

test.cb('verifies simple header contract', t => {
  stubProvider('simple-header', { headers: { 'x-request-id': '12345' } })
  contractMatchesFor('simple-header', t)
})

test.cb('reports status mismatch', t => {
  const expected = { status: 200, headers: {} }
  const actual = { status: 404, headers: emptyHeaders }

  outputFor(expected, actual, output => {
    t.regex(output, /expected: 200/)
    t.regex(output, /actual: {3}404/)
    t.end()
  })
})

test.cb('reports header mismatch', t => {
  const expected = { headers: { 'content-type': 'application/json' } }
  const actual = { headers: { raw: () => ({ 'content-type': [ 'text/xml' ] }) } }

  outputFor(expected, actual, output => {
    t.regex(output, /expected:/)
    t.regex(output, /application\/json/)
    t.regex(output, /actual:/)
    t.regex(output, /text\/xml/)
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

function stubProvider (name, { status = 200, headers } = {}) {
  nock(baseUrl)
    .get(`/api/${name}`)
    .reply(status, { 'hello': 'world' }, headers)
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
