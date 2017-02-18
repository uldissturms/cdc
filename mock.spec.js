import test from 'ava'
import R from 'ramda'
import { serve } from './mock'
import simpleContract from './contracts/simple'

const serveContract = (name, opts) =>
  serve(`./contracts/${name}`, opts)

test.cb('returns simple mock responses', t => {
  const server = serveContract('simple')
  t.is(server.info.protocol, 'http')

  return server.inject('/api/simple', res => {
    t.is(res.statusCode, 200)
    t.deepEqual(res.result, simpleContract.response.body)
    t.end()
  })
})

test.cb('returns custom status code', t => {
  const server = serveContract('simple-status')

  return server.inject('/api/simple-status', res => {
    t.is(res.statusCode, 201)
    t.end()
  })
})

test.cb('returns headers', t => {
  const server = serveContract('simple-header')
  const headers = { 'content-type': 'application/json' }

  return server.inject({
    url: '/api/simple-header',
    headers
  }, res => {
    t.is(res.statusCode, 200)
    t.deepEqual(
        R.pick(['x-request-id'], res.headers),
        { 'x-request-id': '12345' }
      )
    t.end()
  })
})

test.cb('returns response for a matching POST schema', t => {
  const server = serveContract('simple-schema')
  const headers = { 'content-type': 'application/json' }
  const payload = { hello: 'world' }

  return server.inject({
    url: '/api/simple-schema',
    method: 'POST',
    headers,
    payload
  }, res => {
    t.is(res.statusCode, 200)
    t.end()
  })
})

test.cb('returns response for a matching schema with additional headers', t => {
  const server = serveContract('simple-schema')
  const payload = { hello: 'world' }
  const headers = {
    'content-type': 'application/json',
    'postman-token': '2dlnf3qur0w3fiojclksmx02u9prqo'
  }

  return server.inject({
    url: '/api/simple-schema',
    method: 'POST',
    headers,
    payload
  }, res => {
    t.is(res.statusCode, 200)
    t.end()
  })
})

test('supports https mocks', t => {
  const server = serveContract('simple', { tls: true })
  t.is(server.info.protocol, 'https')

  return server.inject('/api/simple', res => {
    t.is(res.statusCode, 200)
  })
})

test.cb('returns 404 for non-matching path', t => {
  nonMatchingContractFor(t, 'simple', {
    url: '/api/non-matching'
  })
})

test.cb('returns 404 for non-matching method', t => {
  nonMatchingContractFor(t, 'simple', {
    url: '/api/simple',
    method: 'POST'
  })
})

test.cb('returns 404 for non-matching header', t => {
  nonMatchingContractFor(t, 'simple-header', {
    url: '/api/simple-header'
  })
})

test.cb('returns 404 for non-matching schema', t => {
  const headers = { 'content-type': 'application/json' }

  nonMatchingContractFor(t, 'simple-schema', {
    url: '/api/simple-schema',
    method: 'POST',
    headers
  })
})

function nonMatchingContractFor (t, name, options) {
  const server = serveContract(name)

  return server.inject(options, res => {
    t.deepEqual(res.statusCode, 404)
    t.end()
  })
}
