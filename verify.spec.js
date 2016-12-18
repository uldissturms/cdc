import test from 'ava'
import tape from 'tape'
import nock from 'nock'
import concat from 'concat-stream'
import verify, { responseMatches, fail } from './verify'

const contractFor = name =>
  `./contracts/${name}`

test.cb('verifies simple contract with base url set', t => {
  const baseUrl = 'http://provider:4000'
  stubProvider(baseUrl)
  contractMatchesFor('simple', baseUrl, t)
})

test.cb('reports status mismatch', t => {
  const expected = { status: 200 }
  const actual = { status: 404 }

  outputFor(expected, actual, output => {
    t.regex(output, /expected: 200/)
    t.regex(output, /actual: {3}404/)
    t.end()
  })
})

test.cb('reports test failure on errors', t => {
  const message = 'error message'
  fail('test name', testStreamFor(output => {
    t.regex(output, /error message/)
    t.end()
  }))({ message })
})

function stubProvider (baseUrl, status = 200) {
  nock(baseUrl)
    .get('/api/simple')
    .reply(status, { 'hello': 'world' })
}

function contractMatchesFor (name, baseUrl, t) {
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
