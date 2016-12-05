# Consumer Driven Contracts (CDC)

CDC provides a way to define mock provider for consumer (now) and verify contracts against provider (soon).
It is written in JavaScript, however can be run in any setup using docker.

## Getting started

### Using docker-compose
```yaml
version: '2'
services:
  api:
    build:
      context: .
    depends_on:
      - dependency
    ports:
      - "8080:8080"
    command: npm start
  mongo:
    image: mongo
    ports:
      - "27017:27017"
  dependency:
    image: uldissturms/cdc
    volumes:
      - ./contracts/dependency:/contracts
    command: mock
    ports:
      - "3000:3000"
```

Where ./contracts/dependency contains index.js that describes contract.
```
./contracts
└── dependency
    └── index.js
```

### Using docker
```
docker run -p 3000:3000 -v ${PWD}/lib:/contracts uldissturms/cdc mock ./contracts/simple-contract
```

### Using npm
```bash
npm i cdc
./node_modules/.bin/cdc mock ./lib/simple-contract
```

## Contracts

#### Simple contract with schema validation
```javascript
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
```
#### Response
```
curl localhost:3000/api/simple-schema -H 'content-type: application/json' -d '{"id":123}'
{"hello": "world"}
```

### Examples

For more examples take a look at contracts in `./lib` used for tests.

## Libraries used
- [Joi](https://npmjs.com/joi) (schema valiations)
- [Hapi](https://npmjs.com/hapi) (mock provider server)

## Influences
- [consumer-contracts](https://www.npmjs.com/consumer-contracts)
- [mockingjay-server](https://github.com/quii/mockingjay-server)
- [pact](https://github.com/realestate-com-au/pact)
- [pacto](https://github.com/thoughtworks/pacto)

## Further reading
- [Consumer-Driven Contracts: A Service Evolution Pattern](http://martinfowler.com/articles/consumerDrivenContracts.html)

## Licence

MIT
