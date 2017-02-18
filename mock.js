const hapi = require('hapi')
const boom = require('boom')
const R = require('ramda')
const fs = require('fs')
const path = require('path')

const { load } = require('./contract-loader')
const { log } = require('./request')
const { joiOptions } = require('./options')

const allMethods = ['GET', 'POST', 'PUT', 'DELETE']
const ignoredHeaders = [
  'accept',
  'accept-encoding',
  'accept-language',
  'cookie',
  'cache-control',
  'connection',
  'content-length',
  'host',
  'upgrade-insecure-requests',
  'user-agent'
]

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
  hasHeaders(R.omit(ignoredHeaders, req.headers)),
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

const replyMatch = (reply, match) => {
  const { status, headers, body } = R.head(match).response
  const response = reply(body).code(status)
  R.forEach(setHeaderFor(response), R.toPairs(headers))
}

const handlerFor = contracts => (req, reply) => {
  log(req)

  const match = contractFor(req)(contracts)

  if (R.isEmpty(match)) {
    return reply(notFound(req))
  }

  replyMatch(reply, match)
}

const tlsOpts = () => ({
  key: fs.readFileSync(path.join(__dirname, 'certs/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs/cert.pem'))
})

const createServerFor = (contracts, { port = 3000, tls = false, cors = true } = {}) => {
  const server = new hapi.Server()
  server.connection(Object.assign({ port, routes: { cors: cors } }, tls ? { tls: tlsOpts() } : {}))
  server.route({
    method: allMethods,
    path: '/{path*}',
    handler: handlerFor(contracts)
  })
  return server
}

const serve = (path, options) =>
  createServerFor(load(path), options)

module.exports = (path, port) => {
  console.log('mocking responses for:', path)

  const server = serve(path, port)
  server.start(err => {
    if (err) {
      console.log('error occured starting server:', err)
    }

    console.log(`server started at ${server.info.uri}`)
  })
  return server
}

module.exports.serve = serve
