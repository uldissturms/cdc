# Consumer Driven Contracts (CDC)
[![wercker status](https://app.wercker.com/status/edf041d1561206d9d42fd539ad9f0e79/s/master "wercker status")](https://app.wercker.com/project/byKey/edf041d1561206d9d42fd539ad9f0e79)
[![Coverage Status](https://coveralls.io/repos/github/uldissturms/cdc/badge.svg)](https://coveralls.io/github/uldissturms/cdc)
[![Code Climate](https://codeclimate.com/github/uldissturms/cdc/badges/gpa.svg)](https://codeclimate.com/github/uldissturms/cdc)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Gitter](https://badges.gitter.im/join_chat.svg)](https://gitter.im/consumer-driven-contracts)

CDC provides a way to define mock provider for consumer and verify contracts against provider.
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
    command: npm start
  dependency:
    image: uldissturms/cdc
    volumes:
      - ./contracts/dependency:/usr/app/src/contracts
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
docker run -p 3000:3000 -v ${PWD}/contracts:/usr/app/src/contracts uldissturms/cdc mock ./contracts/simple
```

### Using npm
```bash
npm i cdc
./node_modules/.bin/cdc mock ./contracts/simple
./node_modules/.bin/cdc verify ./contracts/simple --baseUrl http://localhost:3000
```

## Contracts

#### Simple contract with schema validation
```javascript
const joi = require('joi')

module.exports = {
  name: 'simple request/response schema',
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
      id: 12345
    },
    bodySchema: joi.object().keys({
      id: joi.number().integer()
    })
  }
}
```
#### Response
```
curl localhost:3000/api/simple-schema -H 'content-type: application/json' -d '{"hello": "world"}'
```
``` json
{"id": 12345}
```

## Usage

[Why I wrote my own](http://uldissturms.github.io/2016/12/28/why-i-wrote-my-own-consumer-driven-contracts-library/)

![](/docs/consumer.png)
![](/docs/provider.png)

|          | request       | response      |
| ---------|---------------| --------------|
| consumer | verify schema | mock          |
| provider | request       | verify schema |

- `mock` - mocks responses for consumer
- `verify` - verifies contracts agains provider

### Options
- mock
  - --port, -p - port for running mock server, defaults to 3000 (optional)
  - --no-cors, -C - disable CORS support (optional)
  - --watch, -w - to watch current directory for contract changes (optional)
  - --tls, -t - enable [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security)  with a self signed certificate ( setting `NODE_TLS_REJECT_UNAUTHORIZED=0` when consuming from node might be required )
- verify
  - --baseUrl, -b - base url to run verifications against (required)

### Examples

For more examples take a look at contracts in `./contracts` used for tests.

## Libraries used
- [Joi](https://npmjs.com/joi) (schema valiations)
- [Hapi](https://npmjs.com/hapi) (mock provider server)
- [Tape](https://npmjs.com/tape) (verify consumer contracts against a provider)

## Influences
- [consumer-contracts](https://www.npmjs.com/consumer-contracts)
- [mockingjay-server](https://github.com/quii/mockingjay-server)
- [pact](https://github.com/realestate-com-au/pact)
- [pacto](https://github.com/thoughtworks/pacto)

## Further reading
- [Consumer-Driven Contracts: A Service Evolution Pattern](http://martinfowler.com/articles/consumerDrivenContracts.html)
- [Integration Contract Test](http://martinfowler.com/bliki/IntegrationContractTest.html)
- [Why I wrote my own](http://uldissturms.github.io/2016/12/28/why-i-wrote-my-own-consumer-driven-contracts-library/)

## Licence

MIT
