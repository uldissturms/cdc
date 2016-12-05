import test from 'ava'
import joi from 'joi'
import { load } from './contract-loader'

test('loads contracts from file with defaults set', t => {
  const contracts = load('./contracts/simple')
  const expectedContract = {
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
      status: 200
    }
  }
  t.deepEqual(contracts, [expectedContract])
})
