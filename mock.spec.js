import test from 'ava'
import R from 'ramda'
import { serve } from './mock'
import simpleContract from './contracts/simple'

const serveContract = (name, opts) =>
  serve(`./contracts/${name}`, opts)

test('default mock server options', t => {
  const server = serveContract('simple')
  t.is(server.info.protocol, 'http')
  t.is((typeof server.settings.routes.cors), 'object')
})

test('supports https mocks', async t => {
  const server = serveContract('simple', { tls: true })
  t.is(server.info.protocol, 'https')

  const res = await server.inject('/api/simple')
  t.is(res.statusCode, 200)
})

test('returns simple mock responses', async t => {
  const server = serveContract('simple')
  t.is(server.info.protocol, 'http')

  const res = await server.inject('/api/simple')
  t.is(res.statusCode, 200)
  t.deepEqual(res.result, simpleContract.response.body)
})

test('returns custom status code', async t => {
  const server = serveContract('simple-status')

  const res = await server.inject('/api/simple-status')
  t.is(res.statusCode, 201)
})

test('returns headers', async t => {
  const server = serveContract('simple-header')
  const headers = { 'content-type': 'application/json' }

  const res = await server.inject({
    url: '/api/simple-header',
    headers
  })
  t.is(res.statusCode, 200)
  t.deepEqual(
    R.pick(['x-request-id'], res.headers),
    { 'x-request-id': '12345' }
  )
})

test('returns response for a matching POST schema', async t => {
  const server = serveContract('simple-schema')
  const headers = { 'content-type': 'application/json' }
  const payload = { hello: 'world' }

  const res = await server.inject({
    url: '/api/simple-schema',
    method: 'POST',
    headers,
    payload
  })
  t.is(res.statusCode, 200)
})

test('returns response for a matching schema with additional headers', async t => {
  const server = serveContract('simple-schema')
  const payload = { hello: 'world' }
  const headers = {
    'content-type': 'application/json',
    'postman-token': '2dlnf3qur0w3fiojclksmx02u9prqo'
  }

  const res = await server.inject({
    url: '/api/simple-schema',
    method: 'POST',
    headers,
    payload
  })
  t.is(res.statusCode, 200)
})

test('returns 404 for non-matching path', async t => {
  await nonMatchingContractFor(t, 'simple', {
    url: '/api/non-matching'
  })
})

test('returns 404 for non-matching method', async t => {
  await nonMatchingContractFor(t, 'simple', {
    url: '/api/simple',
    method: 'POST'
  })
})

test('returns 404 for non-matching header', async t => {
  await nonMatchingContractFor(t, 'simple-header', {
    url: '/api/simple-header'
  })
})

test('returns 404 for non-matching schema', async t => {
  const headers = { 'content-type': 'application/json' }

  await nonMatchingContractFor(t, 'simple-schema', {
    url: '/api/simple-schema',
    method: 'POST',
    headers
  })
})

async function nonMatchingContractFor (t, name, options) {
  const server = serveContract(name)

  const res = await server.inject(options)
  t.deepEqual(res.statusCode, 404)
}
