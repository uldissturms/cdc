const joi = require('joi')

module.exports = {
  request: {
    path: '/api/simple-schema',
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    bodySchema: joi.object().keys({
      id: joi.number().integer().required()
    })
  },
  response: {
    body: {
      hello: 'world'
    }
  }
}
