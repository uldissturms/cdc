import test from 'ava'
import joi from 'joi'
import { load } from './contract-loader'

test('loads contracts from file with defaults set', t => {
  const contracts = load('./contracts/simple')
  const expectedContract = {
    name: 'simple endpoint that returns hello world',
    request: {
      path: '/api/simple',
      method: 'GET',
      headers: {},
      bodySchema: joi.object()
    },
    response: {
      body: {
        hello: 'world'
      },
      bodySchema: joi.object(),
      status: 200,
      headers: {}
    }
  }
  t.deepEqual(contracts, [expectedContract])
})
