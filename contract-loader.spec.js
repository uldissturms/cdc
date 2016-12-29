import test from 'ava'
import joi from 'joi'
import { load, dir } from './contract-loader'

test('loads contracts from file with defaults set', t => {
  const contracts = load('./contracts/simple')
  const expectedContract = {
    name: 'simple endpoint that returns hello world',
    request: {
      path: '/api/simple',
      method: 'GET',
      headers: {},
      bodySchema: joi.any()
    },
    response: {
      body: {
        hello: 'world'
      },
      bodySchema: joi.any(),
      status: 200,
      headers: {}
    }
  }
  t.deepEqual(contracts, [expectedContract])
})

test('supports loading an array of contracts', t => {
  const contracts = load('./contracts/multiple')
  t.is(contracts.length, 2)
})

test('resolves contract directory for file', t => {
  return dir('./contracts/simple.js')
    .then(res => t.is(res, `${__dirname}/contracts`))
})

test('resolves contract directory for incomplete file', t => {
  return dir('./contracts/simple')
    .then(res => t.is(res, `${__dirname}/contracts`))
})

test('resolves contract directory for directory', t => {
  return dir('./contracts')
    .then(res => t.is(res, `${__dirname}/contracts`))
})
