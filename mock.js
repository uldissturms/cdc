const hapi = require('hapi')
const boom = require('boom')
const R = require('ramda')
const fs = require('fs')
const path = require('path')

const { load } = require('./contract-loader')
const { log } = require('./request')
const { joiOptions } = require('./options')

const allMethods = ['GET', 'POST', 'PUT', 'DELETE']
const hasPath = R.pathEq([ 'request', 'path' ])
const hasMethod = R.pathEq([ 'request', 'method' ])

const hasHeaders = headers => R.pipe(
  R.path(['request', 'headers']),
  R.merge(headers),
  R.equals(headers)
)

const hasCorrectSchema = ({ method, payload }) => contract => {
  const { bodySchema } = contract.request
  const result = bodySchema.validate(payload, joiOptions)
  return result.error === null
}

const requestMatchesContract = req => R.allPass([
  hasPath(req.path),
  hasMethod(R.toUpper(req.method)),
  hasHeaders(req.headers),
  hasCorrectSchema(req)
])
const contractFor = req => R.filter(requestMatchesContract(req))

const notFound = req =>
  boom.notFound(`mock data not found for ${req.method}: ${req.path}`)

const parseHeader = (name, value) =>
  ({ name, value })

const setHeaderFor = response => header => {
  const { name, value } = parseHeader(...header)
  response.header(name, value)
}

const replyMatch = (h, match) => {
  const { status, headers, body } = R.head(match).response
  const response = h.response(body).code(status)
  R.forEach(setHeaderFor(response), R.toPairs(headers))
  return response
}

const handlerFor = contracts => (req, h) => {
  log(req)

  const match = contractFor(req)(contracts)

  if (R.isEmpty(match)) {
    return notFound(req)
  }

  return replyMatch(h, match)
}

const tlsOpts = () => ({
  key: fs.readFileSync(path.join(__dirname, 'certs/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs/cert.pem'))
})

const createServerFor = (contracts, { port = 3000, tls = false, cors = true } = {}) => {
  const server = new hapi.Server(
    Object.assign({ port, routes: { cors } }, tls ? { tls: tlsOpts() } : {})
  )
  server.route({
    method: allMethods,
    path: '/{path*}',
    handler: handlerFor(contracts)
  })
  return server
}

const serve = (path, options) =>
  createServerFor(load(path), options)

module.exports = async (path, port) => {
  console.log('mocking responses for:', path)

  const server = serve(path, port)
  try {
    await server.start()
    console.log(`server started at ${server.info.uri}`)
  } catch (err) {
    console.error('error occured starting server:', err)
  }
  return server
}

module.exports.serve = serve
