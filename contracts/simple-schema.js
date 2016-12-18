const joi = require('joi')

module.exports = {
  name: 'simple response schema',
  request: {
    path: '/api/simple-schema',
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: {
      hello: 'world'
    },
    bodySchema: joi.object().keys({
      hello: joi.string()
    })
  },
  response: {
    body: {
      id: 1
    },
    bodySchema: joi.object().keys({
      id: joi.number().integer()
    })
  }
}
