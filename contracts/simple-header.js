module.exports = {
  name: 'simple header contract',
  request: {
    path: '/api/simple-header',
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    }
  },
  response: {
    body: {
      hello: 'world'
    },
    headers: {
      'x-request-id': '12345'
    }
  }
}
