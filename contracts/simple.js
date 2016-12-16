module.exports = {
  name: 'simple endpoint that returns hello world',
  request: {
    path: '/api/simple',
    method: 'GET'
  },
  response: {
    body: {
      hello: 'world'
    }
  }
}
