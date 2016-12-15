const hapi = require('hapi')
const boom = require('boom')
const R = require('ramda')

const { load } = require('./contract-loader')
const { log } = require('./request')

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
const validateSchemaForMethods = ['POST', 'PUT']

const hasPath = R.pathEq([ 'request', 'path' ])
const hasMethod = R.pathEq([ 'request', 'method' ])
const hasHeaders = R.pathEq([ 'request', 'headers' ])

const joiOptions = {
  allowUnknown: true,
  presence: 'required'
}

const matchesSchema = ({ method, payload }) => contract => {
  const { bodySchema } = contract.request
  const result = bodySchema.validate(payload, joiOptions)
  return result.error === null
}

const hasCorrectSchema = req =>
  R.ifElse(
    () => R.contains(R.toUpper(req.method), validateSchemaForMethods),
    matchesSchema(req),
    R.T
  )

const contractFor = req => R.pipe(
  R.filter(hasPath(req.path)),
  R.filter(hasMethod(R.toUpper(req.method))),
  R.filter(hasHeaders(R.omit(ignoredHeaders, req.headers))),
  R.filter(hasCorrectSchema(req))
)

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

const createServerFor = (contracts, port) => {
  const server = new hapi.Server()
  server.connection({ port })
  server.route({
    method: allMethods,
    path: '/{path*}',
    handler: handlerFor(contracts)
  })
  return server
}

const serve = (path, port = 3000) =>
  createServerFor(load(path), port)

module.exports = (path, port) => {
  console.log('mocking responses for:', path)

  const server = serve(path, port)
  server.start(err => {
    if (err) {
      console.log('error occured starting server:', err)
    }

    console.log(`server started at ${server.info.uri}`)
  })
}

module.exports.serve = serve
