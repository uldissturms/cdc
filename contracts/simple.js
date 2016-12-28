module.exports = {
  name: 'simple endpoint that returns hello world',
  request: {
    path: '/api/simple'
  },
  response: {
    body: {
      hello: 'world'
    }
  }
}
