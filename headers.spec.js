import test from 'ava'
import { headersFor, normalise } from './headers'

test('picks headers by keys', t => {
  t.deepEqual(headersFor(['a'])({ a: '1', b: '2' }), { a: '1' })
})

test('normalise headers', t => {
  t.deepEqual(normalise({ a: '1' }), { a: ['1'] })
})
