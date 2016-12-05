import test from 'ava'
import R from 'ramda'
import { serve } from './mock'
import simpleContract from './simple-contract'

test.cb('returns simple mock responses', t => {
  const server = serve('./simple-contract')

  return server.inject('/api/simple', res => {
    t.is(res.statusCode, 200)
    t.deepEqual(res.result, simpleContract.response.body)
    t.end()
  })
})

test.cb('returns custom status code', t => {
  const server = serve('./simple-status-contract')

  return server.inject('/api/simple-status', res => {
    t.is(res.statusCode, 201)
    t.end()
  })
})

test.cb('returns headers', t => {
  const server = serve('./simple-header-contract')
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
  const server = serve('./simple-schema-contract')
  const headers = { 'content-type': 'application/json' }
  const payload = { id: 1 }

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

test.cb('returns 404 for non-matching path', t => {
  nonMatchingContractFor(t, './simple-contract', {
    url: '/api/non-matching'
  })
})

test.cb('returns 404 for non-matching method', t => {
  nonMatchingContractFor(t, './simple-contract', {
    url: '/api/simple',
    method: 'POST'
  })
})

test.cb('returns 404 for non-matching header', t => {
  nonMatchingContractFor(t, './simple-header-contract', {
    url: '/api/simple-header'
  })
})

test.cb('returns 404 for non-matching schema', t => {
  const headers = { 'content-type': 'application/json' }

  nonMatchingContractFor(t, './simple-schema-contract', {
    url: '/api/simple-schema',
    method: 'POST',
    headers
  })
})

function nonMatchingContractFor (t, contract, options) {
  const server = serve(contract)

  return server.inject(options, res => {
    t.deepEqual(res.statusCode, 404)
    t.end()
  })
}
